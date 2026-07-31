package tn.esprit.patient.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "symptomes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Symptome {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long patientId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gravite gravite;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime dateSignalement;
}
