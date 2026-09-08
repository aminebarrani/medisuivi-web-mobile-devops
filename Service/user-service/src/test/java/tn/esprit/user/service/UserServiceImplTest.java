package tn.esprit.user.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import tn.esprit.user.dto.*;
import tn.esprit.user.exception.ResourceNotFoundException;
import tn.esprit.user.model.Role;
import tn.esprit.user.model.User;
import tn.esprit.user.repository.UserRepository;
import tn.esprit.user.security.JwtUtils;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private UserServiceImpl userService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .username("johndoe")
                .email("john@example.com")
                .password("encoded_pwd")
                .firstName("John")
                .lastName("Doe")
                .role(Role.MEDECIN)
                .phone("+21612345678")
                .profilePictureUrl("http://example.com/pic.png")
                .active(true)
                .build();
    }

    @Test
    @DisplayName("createUser should save and return user when valid")
    void testCreateUserSuccess() {
        UserCreationDTO creationDTO = UserCreationDTO.builder()
                .username("newuser")
                .email("new@example.com")
                .password("raw_password")
                .firstName("New")
                .lastName("User")
                .role(Role.PATIENT)
                .phone("123456")
                .build();

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("raw_password")).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(2L);
            return u;
        });

        UserDTO result = userService.createUser(creationDTO);

        assertNotNull(result);
        assertEquals(2L, result.getId());
        assertEquals("newuser", result.getUsername());
        assertEquals("new@example.com", result.getEmail());
        assertTrue(result.isActive());
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("createUser should throw when username is already taken")
    void testCreateUserUsernameTaken() {
        UserCreationDTO creationDTO = UserCreationDTO.builder()
                .username("existing")
                .email("test@example.com")
                .build();

        when(userRepository.existsByUsername("existing")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> userService.createUser(creationDTO));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("createUser should throw when email is already registered")
    void testCreateUserEmailTaken() {
        UserCreationDTO creationDTO = UserCreationDTO.builder()
                .username("valid")
                .email("existing@example.com")
                .build();

        when(userRepository.existsByUsername("valid")).thenReturn(false);
        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> userService.createUser(creationDTO));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("login should return token when credentials are valid")
    void testLoginSuccess() {
        LoginRequestDTO request = LoginRequestDTO.builder()
                .usernameOrEmail("johndoe")
                .password("correct_pwd")
                .build();

        when(userRepository.findByUsername("johndoe")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("correct_pwd", "encoded_pwd")).thenReturn(true);
        when(jwtUtils.generateToken("johndoe", "MEDECIN", 1L)).thenReturn("jwt_token_xyz");

        AuthResponseDTO response = userService.login(request);

        assertNotNull(response);
        assertEquals("jwt_token_xyz", response.getToken());
        assertEquals(1L, response.getUser().getId());
    }

    @Test
    @DisplayName("login should throw IllegalArgumentException when user not found")
    void testLoginUserNotFound() {
        LoginRequestDTO request = LoginRequestDTO.builder()
                .usernameOrEmail("unknown")
                .password("pwd")
                .build();

        when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> userService.login(request));
    }

    @Test
    @DisplayName("login should throw IllegalArgumentException when user is inactive")
    void testLoginUserInactive() {
        sampleUser.setActive(false);
        LoginRequestDTO request = LoginRequestDTO.builder()
                .usernameOrEmail("johndoe")
                .password("pwd")
                .build();

        when(userRepository.findByUsername("johndoe")).thenReturn(Optional.of(sampleUser));

        assertThrows(IllegalArgumentException.class, () -> userService.login(request));
    }

    @Test
    @DisplayName("login should throw IllegalArgumentException when password does not match")
    void testLoginWrongPassword() {
        LoginRequestDTO request = LoginRequestDTO.builder()
                .usernameOrEmail("johndoe")
                .password("wrong_pwd")
                .build();

        when(userRepository.findByUsername("johndoe")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("wrong_pwd", "encoded_pwd")).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> userService.login(request));
    }

    @Test
    @DisplayName("getUserById should return UserDTO when found")
    void testGetUserByIdSuccess() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));

        UserDTO result = userService.getUserById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("johndoe", result.getUsername());
    }

    @Test
    @DisplayName("getUserById should throw ResourceNotFoundException when not found")
    void testGetUserByIdNotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.getUserById(999L));
    }

    @Test
    @DisplayName("getAllUsers should return mapped DTOs")
    void testGetAllUsers() {
        User user2 = User.builder().id(2L).username("janedoe").build();
        when(userRepository.findAll()).thenReturn(List.of(sampleUser, user2));

        List<UserDTO> result = userService.getAllUsers();

        assertEquals(2, result.size());
        assertEquals("johndoe", result.get(0).getUsername());
        assertEquals("janedoe", result.get(1).getUsername());
    }

    @Test
    @DisplayName("updateUser should update fields and return updated DTO")
    void testUpdateUserSuccess() {
        UserDTO updateDTO = UserDTO.builder()
                .username("johndoe")
                .email("john@example.com")
                .firstName("Johnny")
                .lastName("Doey")
                .role(Role.ADMIN)
                .phone("999999")
                .profilePictureUrl("http://newpic.png")
                .active(true)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);

        UserDTO result = userService.updateUser(1L, updateDTO);

        assertNotNull(result);
        assertEquals("Johnny", sampleUser.getFirstName());
        assertEquals("Doey", sampleUser.getLastName());
        assertEquals(Role.ADMIN, sampleUser.getRole());
    }

    @Test
    @DisplayName("updateUser should throw ResourceNotFoundException when user does not exist")
    void testUpdateUserNotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());
        UserDTO updateDTO = UserDTO.builder().build();

        assertThrows(ResourceNotFoundException.class, () -> userService.updateUser(999L, updateDTO));
    }

    @Test
    @DisplayName("updateUser should throw when new username already exists")
    void testUpdateUserDuplicateUsername() {
        UserDTO updateDTO = UserDTO.builder()
                .username("taken_username")
                .email("john@example.com")
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(userRepository.existsByUsername("taken_username")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> userService.updateUser(1L, updateDTO));
    }

    @Test
    @DisplayName("updateUser should throw when new email already exists")
    void testUpdateUserDuplicateEmail() {
        UserDTO updateDTO = UserDTO.builder()
                .username("johndoe")
                .email("taken@example.com")
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(userRepository.existsByEmail("taken@example.com")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> userService.updateUser(1L, updateDTO));
    }

    @Test
    @DisplayName("deleteUser should remove user when exists")
    void testDeleteUserSuccess() {
        when(userRepository.existsById(1L)).thenReturn(true);

        userService.deleteUser(1L);

        verify(userRepository).deleteById(1L);
    }

    @Test
    @DisplayName("deleteUser should throw ResourceNotFoundException when user does not exist")
    void testDeleteUserNotFound() {
        when(userRepository.existsById(999L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> userService.deleteUser(999L));
        verify(userRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("processForgotPassword should generate reset code and invoke email service")
    void testProcessForgotPasswordSuccess() {
        ForgotPasswordRequestDTO request = ForgotPasswordRequestDTO.builder()
                .email("john@example.com")
                .build();

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(sampleUser));

        userService.processForgotPassword(request);

        assertNotNull(sampleUser.getResetToken());
        assertEquals(6, sampleUser.getResetToken().length());
        assertNotNull(sampleUser.getResetTokenExpiry());
        verify(userRepository).save(sampleUser);
        verify(emailService).sendPasswordResetEmail(eq("john@example.com"), anyString());
    }

    @Test
    @DisplayName("processForgotPassword should throw IllegalArgumentException when email not found")
    void testProcessForgotPasswordEmailNotFound() {
        ForgotPasswordRequestDTO request = ForgotPasswordRequestDTO.builder()
                .email("unknown@example.com")
                .build();

        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> userService.processForgotPassword(request));
        verify(emailService, never()).sendPasswordResetEmail(any(), any());
    }

    @Test
    @DisplayName("resetPassword should update password and clear reset token when token is valid")
    void testResetPasswordSuccess() {
        sampleUser.setResetToken("123456");
        sampleUser.setResetTokenExpiry(LocalDateTime.now(ZoneId.systemDefault()).plusMinutes(10));

        ResetPasswordRequestDTO request = ResetPasswordRequestDTO.builder()
                .token("123456")
                .newPassword("brand_new_pwd")
                .build();

        when(userRepository.findByResetToken("123456")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.encode("brand_new_pwd")).thenReturn("encoded_brand_new_pwd");

        userService.resetPassword(request);

        assertEquals("encoded_brand_new_pwd", sampleUser.getPassword());
        assertNull(sampleUser.getResetToken());
        assertNull(sampleUser.getResetTokenExpiry());
        verify(userRepository).save(sampleUser);
    }

    @Test
    @DisplayName("resetPassword should throw IllegalArgumentException when token not found")
    void testResetPasswordTokenNotFound() {
        ResetPasswordRequestDTO request = ResetPasswordRequestDTO.builder()
                .token("invalid_token")
                .newPassword("pwd")
                .build();

        when(userRepository.findByResetToken("invalid_token")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> userService.resetPassword(request));
    }

    @Test
    @DisplayName("resetPassword should throw IllegalArgumentException when token is expired")
    void testResetPasswordTokenExpired() {
        sampleUser.setResetToken("123456");
        sampleUser.setResetTokenExpiry(LocalDateTime.now(ZoneId.systemDefault()).minusMinutes(5));

        ResetPasswordRequestDTO request = ResetPasswordRequestDTO.builder()
                .token("123456")
                .newPassword("pwd")
                .build();

        when(userRepository.findByResetToken("123456")).thenReturn(Optional.of(sampleUser));

        assertThrows(IllegalArgumentException.class, () -> userService.resetPassword(request));
    }
}
