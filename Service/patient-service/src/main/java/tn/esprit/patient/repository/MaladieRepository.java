package tn.esprit.patient.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.patient.model.Maladie;

import java.util.Optional;

@Repository
public interface MaladieRepository extends JpaRepository<Maladie, Long> {
    Optional<Maladie> findByNom(String nom);
    boolean existsByNom(String nom);
}
