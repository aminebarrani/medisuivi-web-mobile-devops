package tn.esprit.patient.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.patient.model.Alerte;

import java.util.List;

@Repository
public interface AlerteRepository extends JpaRepository<Alerte, Long> {
    List<Alerte> findByPatientIdOrderByDateCreationDesc(Long patientId);
    List<Alerte> findByPatientIdInOrderByDateCreationDesc(List<Long> patientIds);
    List<Alerte> findByTraiteeOrderByDateCreationDesc(Boolean traitee);
}
