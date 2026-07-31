package tn.esprit.patient.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedecinCreationDTO {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Specialite is required")
    private String specialite;

    @NotBlank(message = "Numero ordre is required")
    private String numeroOrdre;
}
