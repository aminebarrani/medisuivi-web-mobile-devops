package tn.esprit.patient.dto;

import lombok.*;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredictResponseDTO {
    private String gravite;
    private Map<String, Double> probabilities;
}
