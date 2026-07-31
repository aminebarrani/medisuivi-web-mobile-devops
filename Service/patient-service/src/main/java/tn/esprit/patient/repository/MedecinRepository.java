package tn.esprit.patient.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.patient.model.Medecin;

import java.util.Optional;

@Repository
public interface MedecinRepository extends JpaRepository<Medecin, Long> {
    Optional<Medecin> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
    boolean existsByNumeroOrdre(String numeroOrdre);
}
