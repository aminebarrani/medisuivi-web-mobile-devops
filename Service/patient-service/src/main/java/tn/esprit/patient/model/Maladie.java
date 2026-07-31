package tn.esprit.patient.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "maladies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Maladie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nom;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String parametresSuivis;

    private Double seuilMin;

    private Double seuilMax;
}
