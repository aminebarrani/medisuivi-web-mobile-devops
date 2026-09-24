package tn.esprit.patient.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredictResponseDTO {
    private String gravite;
    private Map<String, Double> probabilities;
    private List<String> explanations;

    @JsonProperty("top_facteurs_shap")
    private List<Map<String, Object>> topFacteursShap;

    private Map<String, Object> agent;
}
