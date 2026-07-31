package tn.esprit.patient.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import tn.esprit.patient.model.NiveauRisque;
import tn.esprit.patient.model.SourceAlerte;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlerteCreationDTO {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Niveau de risque is required")
    private NiveauRisque niveauRisque;

    @NotNull(message = "Source is required")
    private SourceAlerte source;

    @NotBlank(message = "Description is required")
    private String description;
}
