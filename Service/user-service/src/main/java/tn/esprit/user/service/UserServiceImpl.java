package tn.esprit.user.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import tn.esprit.user.dto.AuthResponseDTO;
import tn.esprit.user.dto.LoginRequestDTO;
import tn.esprit.user.dto.UserCreationDTO;
import tn.esprit.user.dto.UserDTO;
import tn.esprit.user.model.User;
import tn.esprit.user.repository.UserRepository;
import tn.esprit.user.security.JwtUtils;

import tn.esprit.user.dto.ForgotPasswordRequestDTO;
import tn.esprit.user.dto.ResetPasswordRequestDTO;
import tn.esprit.user.exception.ResourceNotFoundException;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final EmailService emailService;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.emailService = emailService;
    }

    @Override
    public UserDTO createUser(UserCreationDTO creationDTO) {
        if (userRepository.existsByUsername(creationDTO.getUsername())) {
            throw new IllegalArgumentException("Username is already taken");
        }
        if (userRepository.existsByEmail(creationDTO.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User user = User.builder()
                .username(creationDTO.getUsername())
                .email(creationDTO.getEmail())
                .password(passwordEncoder.encode(creationDTO.getPassword()))
                .firstName(creationDTO.getFirstName())
                .lastName(creationDTO.getLastName())
                .role(creationDTO.getRole())
                .phone(creationDTO.getPhone())
                .active(creationDTO.isActive())
                .build();

        User savedUser = userRepository.save(user);
        return mapToDTO(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponseDTO login(LoginRequestDTO loginRequest) {
        String input = loginRequest.getUsernameOrEmail();
        User user = userRepository.findByUsername(input)
                .or(() -> userRepository.findByEmail(input))
                .orElseThrow(() -> new IllegalArgumentException("Invalid username/email or password"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid username/email or password");
        }

        if (!user.isActive()) {
            throw new IllegalStateException("Account is inactive");
        }

        String token = jwtUtils.generateToken(user.getUsername(), user.getRole().name(), user.getId());

        return AuthResponseDTO.builder()
                .token(token)
                .tokenType("Bearer")
                .user(mapToDTO(user))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToDTO(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public UserDTO updateUser(Long id, UserDTO updateDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (!user.getUsername().equals(updateDTO.getUsername()) && userRepository.existsByUsername(updateDTO.getUsername())) {
            throw new IllegalArgumentException("Username is already taken");
        }
        if (!user.getEmail().equals(updateDTO.getEmail()) && userRepository.existsByEmail(updateDTO.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        user.setUsername(updateDTO.getUsername());
        user.setEmail(updateDTO.getEmail());
        user.setFirstName(updateDTO.getFirstName());
        user.setLastName(updateDTO.getLastName());
        user.setRole(updateDTO.getRole());
        user.setPhone(updateDTO.getPhone());
        user.setProfilePictureUrl(updateDTO.getProfilePictureUrl());
        user.setActive(updateDTO.isActive());

        User updatedUser = userRepository.save(user);
        return mapToDTO(updatedUser);
    }

    @Override
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    @Override
    public void processForgotPassword(ForgotPasswordRequestDTO requestDTO) {
        User user = userRepository.findByEmail(requestDTO.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Aucun utilisateur trouvé avec cet e-mail"));

        String resetCode = String.format("%06d", RANDOM.nextInt(900000) + 100000);
        user.setResetToken(resetCode);
        user.setResetTokenExpiry(LocalDateTime.now(ZoneId.systemDefault()).plusMinutes(15));
        userRepository.save(user);

        emailService.sendPasswordResetEmail(user.getEmail(), resetCode);
    }

    @Override
    public void resetPassword(ResetPasswordRequestDTO requestDTO) {
        User user = userRepository.findByResetToken(requestDTO.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Code de réinitialisation invalide ou introuvable."));

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now(ZoneId.systemDefault()))) {
            throw new IllegalArgumentException("Le code de réinitialisation a expiré. Veuillez en demander un nouveau.");
        }

        user.setPassword(passwordEncoder.encode(requestDTO.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }

    private UserDTO mapToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .phone(user.getPhone())
                .profilePictureUrl(user.getProfilePictureUrl())
                .active(user.isActive())
                .build();
    }
}
