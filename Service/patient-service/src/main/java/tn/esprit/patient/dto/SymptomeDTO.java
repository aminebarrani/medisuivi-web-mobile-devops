package tn.esprit.patient.dto;

import lombok.*;
import tn.esprit.patient.model.Gravite;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SymptomeDTO {
    private Long id;
    private Long patientId;
    private String description;
    private Gravite gravite;
    private LocalDateTime dateSignalement;
}
