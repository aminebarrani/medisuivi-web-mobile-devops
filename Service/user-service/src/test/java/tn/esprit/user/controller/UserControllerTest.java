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
import tn.esprit.user.dto.AuthResponseDTO;
import tn.esprit.user.dto.LoginRequestDTO;
import tn.esprit.user.dto.UserCreationDTO;
import tn.esprit.user.dto.UserDTO;
import tn.esprit.user.service.UserService;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private UserDTO userDTO;

    @BeforeEach
    void setUp() {
        userDTO = UserDTO.builder()
                .id(1L)
                .username("johndoe")
                .email("john@example.com")
                .build();
    }

    @Test
    @DisplayName("createUser should return HttpStatus.CREATED with user")
    void testCreateUser() {
        UserCreationDTO creationDTO = UserCreationDTO.builder()
                .username("johndoe")
                .email("john@example.com")
                .build();

        when(userService.createUser(creationDTO)).thenReturn(userDTO);

        ResponseEntity<UserDTO> response = userController.createUser(creationDTO);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(userDTO, response.getBody());
        verify(userService).createUser(creationDTO);
    }

    @Test
    @DisplayName("login should return HttpStatus.OK with AuthResponseDTO")
    void testLogin() {
        LoginRequestDTO request = LoginRequestDTO.builder()
                .usernameOrEmail("johndoe")
                .password("pwd")
                .build();

        AuthResponseDTO authResponse = AuthResponseDTO.builder()
                .token("jwt_token")
                .user(userDTO)
                .build();

        when(userService.login(request)).thenReturn(authResponse);

        ResponseEntity<AuthResponseDTO> response = userController.login(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(authResponse, response.getBody());
        verify(userService).login(request);
    }

    @Test
    @DisplayName("getAllUsers should return HttpStatus.OK with list of users")
    void testGetAllUsers() {
        when(userService.getAllUsers()).thenReturn(List.of(userDTO));

        ResponseEntity<List<UserDTO>> response = userController.getAllUsers();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        verify(userService).getAllUsers();
    }

    @Test
    @DisplayName("getUserById should return HttpStatus.OK with user")
    void testGetUserById() {
        when(userService.getUserById(1L)).thenReturn(userDTO);

        ResponseEntity<UserDTO> response = userController.getUserById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(userDTO, response.getBody());
        verify(userService).getUserById(1L);
    }

    @Test
    @DisplayName("updateUser should return HttpStatus.OK with updated user")
    void testUpdateUser() {
        when(userService.updateUser(eq(1L), any(UserDTO.class))).thenReturn(userDTO);

        ResponseEntity<UserDTO> response = userController.updateUser(1L, userDTO);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(userDTO, response.getBody());
        verify(userService).updateUser(1L, userDTO);
    }

    @Test
    @DisplayName("deleteUser should return HttpStatus.NO_CONTENT")
    void testDeleteUser() {
        doNothing().when(userService).deleteUser(1L);

        ResponseEntity<Void> response = userController.deleteUser(1L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(userService).deleteUser(1L);
    }
}
