package tn.esprit.user.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilsTest {

    private JwtUtils jwtUtils;

    // 256-bit base64 secret key
    private final String base64Secret = Base64.getEncoder().encodeToString("superSecretKeyForMedSuiviApplicationTests1234567890".getBytes());

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", base64Secret);
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", 3600000L); // 1 hour
    }

    @Test
    @DisplayName("generateToken and validateToken should succeed for valid token")
    void testGenerateAndValidateToken() {
        String token = jwtUtils.generateToken("testuser", "MEDECIN", 10L);

        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertTrue(jwtUtils.validateToken(token));
        assertEquals("testuser", jwtUtils.getUsernameFromToken(token));
    }

    @Test
    @DisplayName("validateToken should return false for malformed or corrupted token")
    void testValidateTokenMalformed() {
        assertFalse(jwtUtils.validateToken("invalid.token.structure"));
        assertFalse(jwtUtils.validateToken(""));
        assertFalse(jwtUtils.validateToken(null));
    }

    @Test
    @DisplayName("validateToken should return false when signed with different key")
    void testValidateTokenDifferentKey() {
        JwtUtils otherJwtUtils = new JwtUtils();
        String otherSecret = Base64.getEncoder().encodeToString("differentSecretKeyForAnotherServiceTestingOnly123".getBytes());
        ReflectionTestUtils.setField(otherJwtUtils, "jwtSecret", otherSecret);
        ReflectionTestUtils.setField(otherJwtUtils, "jwtExpirationMs", 3600000L);

        String token = otherJwtUtils.generateToken("testuser", "PATIENT", 5L);

        assertFalse(jwtUtils.validateToken(token));
    }

    @Test
    @DisplayName("getSigningKey fallback for raw string secret shorter than 32 bytes decoded")
    void testRawStringSecretFallback() {
        JwtUtils rawKeyJwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(rawKeyJwtUtils, "jwtSecret", "aVeryLongRawSecretStringToEnsureHmacShaPassesWithoutBase64DecodeError");
        ReflectionTestUtils.setField(rawKeyJwtUtils, "jwtExpirationMs", 3600000L);

        String token = rawKeyJwtUtils.generateToken("user_fallback", "ADMIN", 1L);
        assertNotNull(token);
        assertTrue(rawKeyJwtUtils.validateToken(token));
        assertEquals("user_fallback", rawKeyJwtUtils.getUsernameFromToken(token));
    }
}
