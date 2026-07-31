package tn.esprit.patient.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import tn.esprit.patient.model.NiveauRisque;
import tn.esprit.patient.model.Sexe;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientCreationDTO {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Medecin ID is required")
    private Long medecinId;

    @NotNull(message = "Date de naissance is required")
    private LocalDate dateNaissance;

    @NotNull(message = "Sexe is required")
    private Sexe sexe;

    @Builder.Default
    private NiveauRisque niveauRisque = NiveauRisque.FAIBLE;
}
