package tn.esprit.patient.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientMaladieCreationDTO {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Maladie ID is required")
    private Long maladieId;

    @NotNull(message = "Date diagnostic is required")
    private LocalDate dateDiagnostic;
}
