package tn.esprit.patient.exception;

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
        ResourceNotFoundException ex = new ResourceNotFoundException("Patient not found");
        ResponseEntity<Map<String, Object>> response = exceptionHandler.handleNotFound(ex);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Patient not found", response.getBody().get("message"));
        assertNotNull(response.getBody().get("timestamp"));
    }

    @Test
    @DisplayName("handleBadRequest returns BAD_REQUEST status with message")
    void testHandleBadRequest() {
        IllegalArgumentException ex = new IllegalArgumentException("Invalid input");
        ResponseEntity<Map<String, Object>> response = exceptionHandler.handleBadRequest(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid input", response.getBody().get("message"));
    }

    @Test
    @DisplayName("handleValidation returns BAD_REQUEST with field errors map")
    void testHandleValidation() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        FieldError fieldError = new FieldError("patient", "sexe", "Sexe is required");

        when(ex.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError));

        ResponseEntity<Map<String, Object>> response = exceptionHandler.handleValidation(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Validation failed", response.getBody().get("message"));
        assertTrue(response.getBody().containsKey("errors"));
    }
}
