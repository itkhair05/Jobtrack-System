package com.jobtrack.backend.service;

import com.jobtrack.backend.entity.PasswordResetToken;
import com.jobtrack.backend.entity.User;
import com.jobtrack.backend.repository.PasswordResetTokenRepository;
import com.jobtrack.backend.repository.UserRepository;
import jakarta.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${app.mail.from:onboarding@resend.dev}")
    private String mailFrom;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public PasswordResetService(
            UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            PasswordEncoder passwordEncoder,
            @Autowired(required = false) JavaMailSender mailSender) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
    }

    public void setMailPassword(String mailPassword) {
        this.mailPassword = mailPassword;
    }

    public void setMailFrom(String mailFrom) {
        this.mailFrom = mailFrom;
    }

    public void setFrontendUrl(String frontendUrl) {
        this.frontendUrl = frontendUrl;
    }

    @Transactional
    public void requestReset(String rawEmail) {
        if (rawEmail == null || rawEmail.isBlank()) {
            return;
        }

        String email = rawEmail.trim().toLowerCase();
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            return;
        }

        User user = userOptional.get();
        tokenRepository.deleteByUserId(user.getId());

        String rawToken = generateToken();
        String tokenHash = hashToken(rawToken);

        PasswordResetToken token = new PasswordResetToken();
        token.setUser(user);
        token.setTokenHash(tokenHash);
        token.setExpiresAt(Instant.now().plus(Duration.ofMinutes(60)));
        tokenRepository.save(token);

        String baseUrl = frontendUrl != null ? frontendUrl.trim() : "http://localhost:5173";
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        String resetLink = baseUrl + "/reset-password?token=" + rawToken;

        sendResetEmail(user.getEmail(), resetLink);
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired password reset token");
        }

        String tokenHash = hashToken(rawToken);
        PasswordResetToken token = tokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired password reset token"));

        if (token.getUsedAt() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired password reset token");
        }

        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired password reset token");
        }

        User user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        token.setUsedAt(Instant.now());
        tokenRepository.save(token);

        if (token.getId() != null) {
            tokenRepository.deleteByUserIdExcept(user.getId(), token.getId());
        }
    }

    public String generateToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }

    private void sendResetEmail(String email, String resetLink) {
        if (mailSender == null || mailPassword == null || mailPassword.isBlank()) {
            log.info("RESEND_API_KEY is not configured. Skipping email dispatch.");
            return;
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");
            helper.setFrom(mailFrom);
            helper.setTo(email);
            helper.setSubject("Đặt lại mật khẩu JobTrack");
            helper.setText(buildHtmlEmail(resetLink), true);
            mailSender.send(mimeMessage);
        } catch (Exception e) {
            log.error("Failed to send password reset email", e);
        }
    }

    private String buildHtmlEmail(String resetLink) {
        return """
            <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1e293b;">
              <h2 style="color: #0f172a; margin-bottom: 16px;">Đặt lại mật khẩu JobTrack</h2>
              <p style="font-size: 15px; line-height: 1.5; margin-bottom: 20px;">
                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản JobTrack của bạn. Nhấn vào nút bên dưới để tiến hành đặt mật khẩu mới:
              </p>
              <div style="margin: 28px 0;">
                <a href="%s" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Đặt lại mật khẩu</a>
              </div>
              <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin-bottom: 12px;">
                Liên kết này chỉ có hiệu lực trong vòng <strong>60 phút</strong> và chỉ sử dụng được một lần.
              </p>
              <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 20px;">
                Nếu nút phía trên không hoạt động, vui lòng sao chép và dán liên kết sau vào trình duyệt:<br/>
                <a href="%s" style="color: #2563eb; word-break: break-all;">%s</a>
              </p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              <p style="font-size: 12px; color: #94a3b8; line-height: 1.4;">
                Nếu bạn không yêu cầu đặt lại mật khẩu, bạn có thể an tâm bỏ qua email này. Mật khẩu hiện tại của bạn vẫn được giữ an toàn.
              </p>
            </div>
            """.formatted(resetLink, resetLink, resetLink);
    }
}
