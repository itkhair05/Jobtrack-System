package com.jobtrack.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.jobtrack.backend.entity.PasswordResetToken;
import com.jobtrack.backend.entity.User;
import com.jobtrack.backend.repository.PasswordResetTokenRepository;
import com.jobtrack.backend.repository.UserRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JavaMailSender mailSender;

    private PasswordResetService service;
    private User user;

    @BeforeEach
    void setUp() {
        service = new PasswordResetService(userRepository, tokenRepository, passwordEncoder, mailSender);
        user = new User();
        user.setEmail("user@example.com");
        user.setPasswordHash("old_hash");
    }

    @Test
    void requestReset_unknownEmail_returnsSuccessWithoutCreatingToken() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThatCode(() -> service.requestReset("unknown@example.com"))
                .doesNotThrowAnyException();

        verify(tokenRepository, never()).save(any());
        verifyNoInteractions(mailSender);
    }

    @Test
    void requestReset_knownEmail_createsHashedTokenWith60MinuteExpiry() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        Instant before = Instant.now();
        service.requestReset("user@example.com");
        Instant after = Instant.now();

        ArgumentCaptor<PasswordResetToken> captor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(tokenRepository).save(captor.capture());

        PasswordResetToken savedToken = captor.getValue();
        assertThat(savedToken.getUser()).isEqualTo(user);
        assertThat(savedToken.getTokenHash()).isNotBlank();
        assertThat(savedToken.getExpiresAt()).isAfterOrEqualTo(before.plus(Duration.ofMinutes(59)));
        assertThat(savedToken.getExpiresAt()).isBeforeOrEqualTo(after.plus(Duration.ofMinutes(61)));
    }

    @Test
    void resetPassword_rejectsExpiredToken() {
        String rawToken = "sample-raw-token-1234567890123456";
        String tokenHash = service.hashToken(rawToken);

        PasswordResetToken expiredToken = new PasswordResetToken();
        expiredToken.setUser(user);
        expiredToken.setTokenHash(tokenHash);
        expiredToken.setExpiresAt(Instant.now().minus(Duration.ofMinutes(5)));

        when(tokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(expiredToken));

        assertThatThrownBy(() -> service.resetPassword(rawToken, "newSecretPassword123"))
                .isInstanceOfSatisfying(ResponseStatusException.class, ex -> {
                    assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(ex.getReason()).contains("Invalid or expired");
                });

        verify(userRepository, never()).save(any());
    }

    @Test
    void resetPassword_rejectsAlreadyUsedToken() {
        String rawToken = "sample-raw-token-1234567890123456";
        String tokenHash = service.hashToken(rawToken);

        PasswordResetToken usedToken = new PasswordResetToken();
        usedToken.setUser(user);
        usedToken.setTokenHash(tokenHash);
        usedToken.setExpiresAt(Instant.now().plus(Duration.ofMinutes(30)));
        usedToken.setUsedAt(Instant.now().minus(Duration.ofMinutes(10)));

        when(tokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(usedToken));

        assertThatThrownBy(() -> service.resetPassword(rawToken, "newSecretPassword123"))
                .isInstanceOfSatisfying(ResponseStatusException.class, ex -> {
                    assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(ex.getReason()).contains("Invalid or expired");
                });

        verify(userRepository, never()).save(any());
    }

    @Test
    void resetPassword_updatesPasswordHashOnValidToken() {
        String rawToken = "sample-raw-token-1234567890123456";
        String tokenHash = service.hashToken(rawToken);

        PasswordResetToken validToken = new PasswordResetToken();
        validToken.setUser(user);
        validToken.setTokenHash(tokenHash);
        validToken.setExpiresAt(Instant.now().plus(Duration.ofMinutes(45)));

        when(tokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(validToken));
        when(passwordEncoder.encode("newSecretPassword123")).thenReturn("new_encoded_hash");

        service.resetPassword(rawToken, "newSecretPassword123");

        assertThat(user.getPasswordHash()).isEqualTo("new_encoded_hash");
        assertThat(validToken.getUsedAt()).isNotNull();
        verify(userRepository).save(user);
        verify(tokenRepository).save(validToken);
    }
}
