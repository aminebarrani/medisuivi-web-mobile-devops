package tn.esprit.patient.repository;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import tn.esprit.patient.model.NiveauRisque;
import tn.esprit.patient.model.Patient;
import tn.esprit.patient.model.Sexe;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class PatientRepositoryTest {

    @Autowired
    private PatientRepository patientRepository;

    @Test
    @DisplayName("Should save patient and find by userId")
    void testFindByUserId() {
        Patient patient = Patient.builder()
                .userId(500L)
                .medecinId(10L)
                .dateNaissance(LocalDate.of(1985, 1, 1))
                .sexe(Sexe.M)
                .niveauRisque(NiveauRisque.FAIBLE)
                .build();

        patientRepository.save(patient);

        Optional<Patient> found = patientRepository.findByUserId(500L);
        assertTrue(found.isPresent());
        assertEquals(10L, found.get().getMedecinId());
        assertTrue(patientRepository.existsByUserId(500L));
        assertFalse(patientRepository.existsByUserId(999L));
    }

    @Test
    @DisplayName("Should find patients by medecinId")
    void testFindByMedecinId() {
        Patient p1 = Patient.builder()
                .userId(501L)
                .medecinId(12L)
                .dateNaissance(LocalDate.of(1990, 2, 2))
                .sexe(Sexe.F)
                .niveauRisque(NiveauRisque.FAIBLE)
                .build();

        Patient p2 = Patient.builder()
                .userId(502L)
                .medecinId(12L)
                .dateNaissance(LocalDate.of(1992, 3, 3))
                .sexe(Sexe.M)
                .niveauRisque(NiveauRisque.ELEVE)
                .build();

        patientRepository.save(p1);
        patientRepository.save(p2);

        List<Patient> list = patientRepository.findByMedecinId(12L);
        assertEquals(2, list.size());
    }
}