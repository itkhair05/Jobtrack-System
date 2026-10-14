package com.jobtrack.backend.service;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Service
public class ResendEmailService {

    private static final Logger log = LoggerFactory.getLogger(ResendEmailService.class);
    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    private final RestClient restClient;

    @Value("${resend.api-key:${RESEND_API_KEY:}}")
    private String resendApiKey;

    @Value("${app.mail.from:${MAIL_FROM:onboarding@resend.dev}}")
    private String mailFrom;

    public ResendEmailService() {
        this(RestClient.create());
    }

    public ResendEmailService(RestClient restClient) {
        this.restClient = restClient != null ? restClient : RestClient.create();
    }

    public void setResendApiKey(String resendApiKey) {
        this.resendApiKey = resendApiKey;
    }

    public void setMailFrom(String mailFrom) {
        this.mailFrom = mailFrom;
    }

    public void sendPasswordResetEmail(String to, String resetLink) {
        if (resendApiKey == null || resendApiKey.isBlank()) {
            log.info("RESEND_API_KEY is not configured. Dev fallback: Reset link for {} is: {}", to, resetLink);
            return;
        }

        String html = buildHtmlEmail(resetLink);
        ResendEmailRequest request = new ResendEmailRequest(mailFrom, List.of(to), "Đặt lại mật khẩu JobTrack", html);

        try {
            ResendEmailResponse response = restClient.post()
                    .uri(RESEND_API_URL)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + resendApiKey.trim())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(ResendEmailResponse.class);

            if (response != null && response.id() != null) {
                log.info("Password reset email sent successfully via Resend API. Email ID: {}", response.id());
            } else {
                log.info("Password reset email sent successfully via Resend API.");
            }
        } catch (RestClientResponseException ex) {
            log.error("Failed to send email via Resend API: HTTP {} - {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            throw new IllegalStateException("Failed to send email via Resend API: HTTP " + ex.getStatusCode().value(), ex);
        } catch (Exception ex) {
            log.error("Failed to send email via Resend API: {}", ex.getMessage());
            throw new IllegalStateException("Failed to send email via Resend API: " + ex.getMessage(), ex);
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

    public record ResendEmailRequest(String from, List<String> to, String subject, String html) {}
    public record ResendEmailResponse(String id) {}
}
