package tn.esprit.patient.dto;

import lombok.*;
import tn.esprit.patient.model.Source;
import tn.esprit.patient.model.TypeMesure;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MesureDTO {
    private Long id;
    private Long patientId;
    private TypeMesure typeMesure;
    private Double valeur;
    private String unite;
    private Source source;
    private LocalDateTime dateMesure;
}
