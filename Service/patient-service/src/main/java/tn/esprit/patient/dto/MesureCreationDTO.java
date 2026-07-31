package tn.esprit.patient.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import tn.esprit.patient.model.Source;
import tn.esprit.patient.model.TypeMesure;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MesureCreationDTO {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Type de mesure is required")
    private TypeMesure typeMesure;

    @NotNull(message = "Valeur is required")
    private Double valeur;

    @NotBlank(message = "Unité is required")
    private String unite;

    @NotNull(message = "Source is required")
    private Source source;
}
