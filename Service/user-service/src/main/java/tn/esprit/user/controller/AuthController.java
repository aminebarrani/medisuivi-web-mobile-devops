package tn.esprit.user.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.user.dto.AuthResponseDTO;
import tn.esprit.user.dto.LoginRequestDTO;
import tn.esprit.user.dto.UserCreationDTO;
import tn.esprit.user.dto.UserDTO;
import tn.esprit.user.service.UserService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;

    @Autowired
    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserDTO> register(@Valid @RequestBody UserCreationDTO creationDTO) {
        UserDTO createdUser = userService.createUser(creationDTO);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        AuthResponseDTO response = userService.login(loginRequest);
        return ResponseEntity.ok(response);
    }
}
