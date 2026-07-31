package tn.esprit.patient.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.patient.model.NiveauRisque;
import tn.esprit.patient.model.Patient;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
    List<Patient> findByMedecinId(Long medecinId);
    List<Patient> findByMedecinIdAndNiveauRisque(Long medecinId, NiveauRisque niveauRisque);

    @Query("""
            SELECT p FROM Patient p
            WHERE p.medecinId = :medecinId
            AND p.id IN (
                SELECT pm.patientId FROM PatientMaladie pm WHERE pm.maladieId = :maladieId
            )
            """)
    List<Patient> findByMedecinIdAndMaladieId(@Param("medecinId") Long medecinId,
                                              @Param("maladieId") Long maladieId);

    @Query("""
            SELECT p FROM Patient p
            WHERE p.medecinId = :medecinId
            AND p.niveauRisque = :niveauRisque
            AND p.id IN (
                SELECT pm.patientId FROM PatientMaladie pm WHERE pm.maladieId = :maladieId
            )
            """)
    List<Patient> findByMedecinIdAndMaladieIdAndNiveauRisque(@Param("medecinId") Long medecinId,
                                                             @Param("maladieId") Long maladieId,
                                                             @Param("niveauRisque") NiveauRisque niveauRisque);
}
