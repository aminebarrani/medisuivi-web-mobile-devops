package tn.esprit.user.service;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import tn.esprit.user.exception.EmailDeliveryException;

import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    private EmailService emailService;

    @BeforeEach
    void setUp() {
        emailService = new EmailService(mailSender, "http://localhost:5173/");
    }

    @Test
    @DisplayName("sendPasswordResetEmail should create and send message successfully")
    void testSendPasswordResetEmailSuccess() {
        MimeMessage mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doNothing().when(mailSender).send(any(MimeMessage.class));

        assertDoesNotThrow(() -> emailService.sendPasswordResetEmail("patient@example.com", "123456"));
        verify(mailSender).createMimeMessage();
        verify(mailSender).send(mimeMessage);
    }

    @Test
    @DisplayName("sendPasswordResetEmail should throw EmailDeliveryException on failure")
    void testSendPasswordResetEmailThrowsException() {
        when(mailSender.createMimeMessage()).thenAnswer(invocation -> {
            throw new RuntimeException("SMTP connection failed");
        });

        assertThrows(RuntimeException.class, () ->
                emailService.sendPasswordResetEmail("patient@example.com", "123456")
        );
    }
}
