package tn.esprit.patient.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientMaladieDTO {
    private Long id;
    private Long patientId;
    private Long maladieId;
    private LocalDate dateDiagnostic;
}
