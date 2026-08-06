package tn.esprit.patient.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredictRequestDTO {
    private Double age;
    private String sexe;
    private String disease;

    @JsonProperty("jours_depuis_diagnostic")
    private Double joursDepuisDiagnostic;

    @JsonProperty("valeur_mesure_proche")
    private Double valeurMesureProche;

    @JsonProperty("deviation_score")
    private Double deviationScore;

    @JsonProperty("rolling_mean_14j")
    private Double rollingMean14j;

    @JsonProperty("rolling_std_14j")
    private Double rollingStd14j;

    @JsonProperty("trend_slope_14j")
    private Double trendSlope14j;

    @JsonProperty("nb_symptomes_recents_7j")
    private Double nbSymptomesRecents7j;
}
