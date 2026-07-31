package tn.esprit.patient.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaladieCreationDTO {

    @NotBlank(message = "Nom is required")
    private String nom;

    private String description;

    @NotBlank(message = "Parametres suivis is required")
    private String parametresSuivis;

    private Double seuilMin;

    private Double seuilMax;
}
