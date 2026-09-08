package tn.esprit.user.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
    }

    @Test
    @DisplayName("handleNotFound returns NOT_FOUND status with message")
    void testHandleNotFound() {
        ResourceNotFoundException ex = new ResourceNotFoundException("User not found");
        ResponseEntity<Map<String, String>> response = exceptionHandler.handleNotFound(ex);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("User not found", response.getBody().get("message"));
    }

    @Test
    @DisplayName("handleIllegalArgument returns BAD_REQUEST status with message")
    void testHandleIllegalArgument() {
        IllegalArgumentException ex = new IllegalArgumentException("Username is taken");
        ResponseEntity<Map<String, String>> response = exceptionHandler.handleIllegalArgument(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Username is taken", response.getBody().get("message"));
    }

    @Test
    @DisplayName("handleIllegalState returns CONFLICT status with message")
    void testHandleIllegalState() {
        IllegalStateException ex = new IllegalStateException("Conflict occurred");
        ResponseEntity<Map<String, String>> response = exceptionHandler.handleIllegalState(ex);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("Conflict occurred", response.getBody().get("message"));
    }

    @Test
    @DisplayName("handleValidation returns BAD_REQUEST with field error message")
    void testHandleValidation() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        FieldError fieldError = new FieldError("user", "email", "Email must be valid");

        when(ex.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError));

        ResponseEntity<Map<String, String>> response = exceptionHandler.handleValidation(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Email must be valid", response.getBody().get("message"));
    }

    @Test
    @DisplayName("handleValidation returns default message when no field errors exist")
    void testHandleValidationEmptyErrors() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);

        when(ex.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(List.of());

        ResponseEntity<Map<String, String>> response = exceptionHandler.handleValidation(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Validation failed", response.getBody().get("message"));
    }

    @Test
    @DisplayName("handleEmailDelivery returns SERVICE_UNAVAILABLE status with message")
    void testHandleEmailDelivery() {
        EmailDeliveryException ex = new EmailDeliveryException("Failed to send email", new RuntimeException("SMTP error"));
        ResponseEntity<Map<String, String>> response = exceptionHandler.handleEmailDelivery(ex);

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        assertEquals("Failed to send email", response.getBody().get("message"));
    }
}
