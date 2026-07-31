package tn.esprit.patient.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaladieDTO {
    private Long id;
    private String nom;
    private String description;
    private String parametresSuivis;
    private Double seuilMin;
    private Double seuilMax;
}
