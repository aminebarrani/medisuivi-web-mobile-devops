package tn.esprit.user.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import tn.esprit.user.dto.*;
import tn.esprit.user.service.UserService;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private AuthController authController;

    private UserDTO userDTO;

    @BeforeEach
    void setUp() {
        userDTO = UserDTO.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .build();
    }

    @Test
    @DisplayName("register should return HttpStatus.CREATED with created user")
    void testRegister() {
        UserCreationDTO creationDTO = UserCreationDTO.builder()
                .username("testuser")
                .email("test@example.com")
                .password("pwd123")
                .build();

        when(userService.createUser(creationDTO)).thenReturn(userDTO);

        ResponseEntity<UserDTO> response = authController.register(creationDTO);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(userDTO, response.getBody());
        verify(userService).createUser(creationDTO);
    }

    @Test
    @DisplayName("login should return HttpStatus.OK with AuthResponseDTO")
    void testLogin() {
        LoginRequestDTO loginRequest = LoginRequestDTO.builder()
                .usernameOrEmail("testuser")
                .password("pwd123")
                .build();

        AuthResponseDTO authResponse = AuthResponseDTO.builder()
                .token("sample_jwt")
                .user(userDTO)
                .build();

        when(userService.login(loginRequest)).thenReturn(authResponse);

        ResponseEntity<AuthResponseDTO> response = authController.login(loginRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(authResponse, response.getBody());
        verify(userService).login(loginRequest);
    }

    @Test
    @DisplayName("forgotPassword should return HttpStatus.OK with confirmation message")
    void testForgotPassword() {
        ForgotPasswordRequestDTO requestDTO = ForgotPasswordRequestDTO.builder()
                .email("test@example.com")
                .build();

        doNothing().when(userService).processForgotPassword(requestDTO);

        ResponseEntity<Map<String, String>> response = authController.forgotPassword(requestDTO);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().containsKey("message"));
        verify(userService).processForgotPassword(requestDTO);
    }

    @Test
    @DisplayName("resetPassword should return HttpStatus.OK with confirmation message")
    void testResetPassword() {
        ResetPasswordRequestDTO requestDTO = ResetPasswordRequestDTO.builder()
                .token("123456")
                .newPassword("new_pwd")
                .build();

        doNothing().when(userService).resetPassword(requestDTO);

        ResponseEntity<Map<String, String>> response = authController.resetPassword(requestDTO);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().containsKey("message"));
        verify(userService).resetPassword(requestDTO);
    }
}
