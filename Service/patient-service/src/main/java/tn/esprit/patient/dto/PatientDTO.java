package tn.esprit.patient.dto;

import lombok.*;
import tn.esprit.patient.model.NiveauRisque;
import tn.esprit.patient.model.Sexe;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientDTO {
    private Long id;
    private Long userId;
    private Long medecinId;
    private LocalDate dateNaissance;
    private Sexe sexe;
    private NiveauRisque niveauRisque;
    private LocalDateTime dateCreation;
}
