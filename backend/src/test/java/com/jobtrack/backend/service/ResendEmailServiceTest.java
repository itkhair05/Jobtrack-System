package com.jobtrack.backend.service;

import static org.assertj.core.api.Assertions.assertThatCode;

import org.junit.jupiter.api.Test;

class ResendEmailServiceTest {

    @Test
    void sendPasswordResetEmail_withoutApiKey_logsFallbackAndDoesNotThrow() {
        ResendEmailService service = new ResendEmailService();
        service.setResendApiKey("");

        assertThatCode(() -> service.sendPasswordResetEmail("test@example.com", "http://localhost:5173/reset-password?token=abc"))
                .doesNotThrowAnyException();
    }
}
