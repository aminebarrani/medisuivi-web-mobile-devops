package tn.esprit.patient.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "medecins")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medecin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId;

    @Column(nullable = false)
    private String specialite;

    @Column(nullable = false, unique = true)
    private String numeroOrdre;
}
