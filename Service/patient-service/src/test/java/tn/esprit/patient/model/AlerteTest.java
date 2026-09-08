package tn.esprit.patient.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class AlerteTest {

    @Test
    @DisplayName("Should create Alerte using Builder and test defaults")
    void testAlerteBuilder() {
        LocalDateTime now = LocalDateTime.now();
        Alerte alerte = Alerte.builder()
                .id(10L)
                .patientId(1L)
                .niveauRisque(NiveauRisque.CRITIQUE)
                .source(SourceAlerte.SYMPTOME)
                .description("Douleur thoracique aiguë")
                .dateCreation(now)
                .build();

        assertEquals(10L, alerte.getId());
        assertEquals(1L, alerte.getPatientId());
        assertEquals(NiveauRisque.CRITIQUE, alerte.getNiveauRisque());
        assertEquals(SourceAlerte.SYMPTOME, alerte.getSource());
        assertEquals("Douleur thoracique aiguë", alerte.getDescription());
        assertEquals(now, alerte.getDateCreation());
        assertFalse(alerte.getTraitee());

        alerte.setTraitee(true);
        assertTrue(alerte.getTraitee());
    }
}