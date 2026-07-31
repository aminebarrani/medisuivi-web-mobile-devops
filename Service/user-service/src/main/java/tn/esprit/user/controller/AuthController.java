package tn.esprit.user.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.user.dto.AuthResponseDTO;
import tn.esprit.user.dto.ForgotPasswordRequestDTO;
import tn.esprit.user.dto.LoginRequestDTO;
import tn.esprit.user.dto.ResetPasswordRequestDTO;
import tn.esprit.user.dto.UserCreationDTO;
import tn.esprit.user.dto.UserDTO;
import tn.esprit.user.service.UserService;

import java.util.Map;

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

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO requestDTO) {
        userService.processForgotPassword(requestDTO);
        return ResponseEntity.ok(Map.of("message", "Un e-mail de réinitialisation contenant votre code a été envoyé."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO requestDTO) {
        userService.resetPassword(requestDTO);
        return ResponseEntity.ok(Map.of("message", "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter."));
    }
}
