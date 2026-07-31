package tn.esprit.patient.dto;

import lombok.*;
import tn.esprit.patient.model.NiveauRisque;
import tn.esprit.patient.model.SourceAlerte;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlerteDTO {
    private Long id;
    private Long patientId;
    private NiveauRisque niveauRisque;
    private SourceAlerte source;
    private String description;
    private LocalDateTime dateCreation;
    private Boolean traitee;
}
