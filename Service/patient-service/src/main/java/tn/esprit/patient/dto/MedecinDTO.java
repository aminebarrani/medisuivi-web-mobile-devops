package tn.esprit.patient.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedecinDTO {
    private Long id;
    private Long userId;
    private String specialite;
    private String numeroOrdre;
}
