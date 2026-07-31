package tn.esprit.patient.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.patient.model.Symptome;

import java.util.List;

@Repository
public interface SymptomeRepository extends JpaRepository<Symptome, Long> {
    List<Symptome> findByPatientIdOrderByDateSignalementDesc(Long patientId);
    List<Symptome> findByPatientIdInOrderByDateSignalementDesc(List<Long> patientIds);
}
