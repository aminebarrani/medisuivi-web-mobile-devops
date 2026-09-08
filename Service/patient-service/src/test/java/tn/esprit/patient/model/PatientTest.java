package tn.esprit.patient.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class PatientTest {

    @Test
    @DisplayName("Should create Patient using Builder and verify getters")
    void testPatientBuilderAndGetters() {
        LocalDate birthDate = LocalDate.of(1990, 5, 15);
        LocalDateTime now = LocalDateTime.now();

        Patient patient = Patient.builder()
                .id(1L)
                .userId(100L)
                .medecinId(5L)
                .dateNaissance(birthDate)
                .sexe(Sexe.M)
                .niveauRisque(NiveauRisque.ELEVE)
                .dateCreation(now)
                .build();

        assertEquals(1L, patient.getId());
        assertEquals(100L, patient.getUserId());
        assertEquals(5L, patient.getMedecinId());
        assertEquals(birthDate, patient.getDateNaissance());
        assertEquals(Sexe.M, patient.getSexe());
        assertEquals(NiveauRisque.ELEVE, patient.getNiveauRisque());
        assertEquals(now, patient.getDateCreation());
    }

    @Test
    @DisplayName("Should test default values")
    void testDefaultValues() {
        Patient emptyPatient = new Patient();
        assertNull(emptyPatient.getId());

        Patient patient = Patient.builder()
                .userId(101L)
                .medecinId(6L)
                .sexe(Sexe.F)
                .build();

        assertEquals(NiveauRisque.FAIBLE, patient.getNiveauRisque());
    }
}