package tn.esprit.patient.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.patient.model.PatientMaladie;

import java.util.List;

@Repository
public interface PatientMaladieRepository extends JpaRepository<PatientMaladie, Long> {
    List<PatientMaladie> findByPatientId(Long patientId);
    List<PatientMaladie> findByMaladieId(Long maladieId);
    boolean existsByPatientIdAndMaladieId(Long patientId, Long maladieId);
}
