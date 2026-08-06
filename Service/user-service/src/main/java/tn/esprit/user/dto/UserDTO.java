package tn.esprit.user.dto;

import lombok.*;
import tn.esprit.user.model.Role;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private String phone;
    private String profilePictureUrl;
    private boolean active;
}
