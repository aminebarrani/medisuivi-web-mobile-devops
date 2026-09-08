package tn.esprit.patient.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class SymptomeTest {

    @Test
    @DisplayName("Should create Symptome entity and verify attributes")
    void testSymptomeEntity() {
        LocalDateTime now = LocalDateTime.now();
        Symptome symptome = Symptome.builder()
                .id(5L)
                .patientId(3L)
                .description("Migraine sévère")
                .gravite(Gravite.GRAVE)
                .dateSignalement(now)
                .build();

        assertEquals(5L, symptome.getId());
        assertEquals(3L, symptome.getPatientId());
        assertEquals("Migraine sévère", symptome.getDescription());
        assertEquals(Gravite.GRAVE, symptome.getGravite());
        assertEquals(now, symptome.getDateSignalement());
    }
}
