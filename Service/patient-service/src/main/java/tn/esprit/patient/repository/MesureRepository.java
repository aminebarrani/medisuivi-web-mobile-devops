package tn.esprit.patient.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.patient.model.Mesure;

import java.util.List;

@Repository
public interface MesureRepository extends JpaRepository<Mesure, Long> {
    List<Mesure> findByPatientIdOrderByDateMesureDesc(Long patientId);
    List<Mesure> findByPatientIdInOrderByDateMesureDesc(List<Long> patientIds);
}
