package tn.esprit.patient.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "mesures")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mesure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long patientId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeMesure typeMesure;

    @Column(nullable = false)
    private Double valeur;

    @Column(nullable = false)
    private String unite;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Source source;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime dateMesure;
}
