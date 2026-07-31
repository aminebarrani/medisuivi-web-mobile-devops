package tn.esprit.user.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import tn.esprit.user.exception.EmailDeliveryException;

@Service
public class EmailService {

    private static final String FROM_ADDRESS = "MedSuivi <noreply@medsuivi.tn>";

    private final JavaMailSender mailSender;
    private final String frontendUrl;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${medsuivi.frontend.url:http://localhost:5173}") String frontendUrl) {
        this.mailSender = mailSender;
        this.frontendUrl = frontendUrl.replaceAll("/$", "");
    }

    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        String resetUrl = frontendUrl + "/reset-password?token=" + resetToken;

        String htmlContent = """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #e2e8f0; margin: 0; padding: 40px 20px; }
                .card { max-width: 520px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #334155; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
                .logo { text-align: center; margin-bottom: 24px; }
                .logo h1 { color: #14b8a6; font-size: 28px; margin: 0; }
                .code-box { background: #0f172a; border: 2px solid #38bdf8; color: #38bdf8; font-size: 32px; font-weight: bold; letter-spacing: 6px; text-align: center; padding: 16px; border-radius: 12px; margin: 24px 0; }
                .btn { display: block; width: 100%; max-width: 280px; margin: 24px auto; padding: 14px 24px; background: linear-gradient(135deg, #14b8a6, #06b6d4); color: #ffffff !important; text-align: center; text-decoration: none; font-weight: bold; border-radius: 10px; }
                .footer { font-size: 12px; color: #64748b; text-align: center; margin-top: 32px; }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="logo">
                  <h1>MedSuivi</h1>
                  <p style="color: #94a3b8; font-size: 14px;">Service de réinitialisation de mot de passe</p>
                </div>
                <p>Bonjour,</p>
                <p>Vous avez demandé la réinitialisation de votre mot de passe MedSuivi. Voici votre code de validation :</p>

                <div class="code-box">{{TOKEN}}</div>

                <p style="text-align: center;">Ou cliquez sur le bouton ci-dessous pour changer votre mot de passe :</p>
                <a href="{{RESET_URL}}" class="btn">Réinitialiser le mot de passe</a>

                <p style="font-size: 13px; color: #94a3b8;">Ce code est valide pendant <strong>15 minutes</strong>. Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet e-mail.</p>

                <div class="footer">
                  © 2025 MedSuivi — Plateforme pour professionnels de santé
                </div>
              </div>
            </body>
            </html>
            """
            .replace("{{TOKEN}}", resetToken)
            .replace("{{RESET_URL}}", resetUrl);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(FROM_ADDRESS);
            helper.setTo(toEmail);
            helper.setSubject("MedSuivi - Réinitialisation de votre mot de passe");
            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new EmailDeliveryException(
                    "Impossible d'envoyer l'e-mail de réinitialisation. Vérifiez la configuration SMTP Mailtrap.",
                    e);
        }
    }
}
