package com.jobtrack.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final long DEFAULT_WINDOW_MILLIS = 60_000;
    private static final long ONE_HOUR_MILLIS = 3_600_000;

    private final Map<String, Counter> counters = new ConcurrentHashMap<>();
    private final AtomicLong lastCleanup = new AtomicLong(System.currentTimeMillis());

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        RateLimitConfig config = resolveConfig(path);
        if (config == null) {
            chain.doFilter(request, response);
            return;
        }

        long now = System.currentTimeMillis();
        cleanupExpired(now);
        String key = request.getRemoteAddr() + ":" + path;
        Counter counter = counters.compute(key, (ignored, current) -> {
            if (current == null || now - current.startedAt > config.windowMillis()) {
                return new Counter(now, 1, config.windowMillis());
            }
            return new Counter(current.startedAt, current.count + 1, config.windowMillis());
        });
        if (counter.count > config.limit()) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"timestamp\":\"" + Instant.now() + "\",\"status\":429,\"message\":\"Too many requests\",\"path\":\"" + path + "\"}");
            return;
        }
        chain.doFilter(request, response);
    }

    private RateLimitConfig resolveConfig(String path) {
        if (path.equals("/api/v1/auth/forgot-password")) {
            return new RateLimitConfig(3, ONE_HOUR_MILLIS);
        }
        if (path.equals("/api/v1/auth/reset-password")) {
            return new RateLimitConfig(5, ONE_HOUR_MILLIS);
        }
        if (path.startsWith("/api/v1/auth/")) {
            return new RateLimitConfig(10, DEFAULT_WINDOW_MILLIS);
        }
        if (path.equals("/api/v1/cvs/upload")) {
            return new RateLimitConfig(20, DEFAULT_WINDOW_MILLIS);
        }
        return null;
    }

    private void cleanupExpired(long now) {
        long previousCleanup = lastCleanup.get();
        if (now - previousCleanup < DEFAULT_WINDOW_MILLIS || !lastCleanup.compareAndSet(previousCleanup, now)) return;
        counters.entrySet().removeIf(entry -> now - entry.getValue().startedAt > entry.getValue().windowMillis);
    }

    private record RateLimitConfig(int limit, long windowMillis) { }
    private record Counter(long startedAt, int count, long windowMillis) { }
}