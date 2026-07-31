package tn.esprit.user.service;

import tn.esprit.user.dto.AuthResponseDTO;
import tn.esprit.user.dto.LoginRequestDTO;
import tn.esprit.user.dto.UserCreationDTO;
import tn.esprit.user.dto.UserDTO;
import tn.esprit.user.dto.ForgotPasswordRequestDTO;
import tn.esprit.user.dto.ResetPasswordRequestDTO;
import java.util.List;

public interface UserService {
    UserDTO createUser(UserCreationDTO creationDTO);
    AuthResponseDTO login(LoginRequestDTO loginRequest);
    UserDTO getUserById(Long id);
    List<UserDTO> getAllUsers();
    UserDTO updateUser(Long id, UserDTO updateDTO);
    void deleteUser(Long id);

    void processForgotPassword(ForgotPasswordRequestDTO requestDTO);
    void resetPassword(ResetPasswordRequestDTO requestDTO);
}
