package tn.esprit.patient.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class MesureTest {

    @Test
    @DisplayName("Should create Mesure entity and verify getters/setters")
    void testMesureEntity() {
        LocalDateTime now = LocalDateTime.now();
        Mesure mesure = Mesure.builder()
                .id(1L)
                .patientId(2L)
                .typeMesure(TypeMesure.GLYCEMIE)
                .valeur(180.5)
                .unite("mg/dL")
                .source(Source.CAPTEUR)
                .dateMesure(now)
                .build();

        assertEquals(1L, mesure.getId());
        assertEquals(2L, mesure.getPatientId());
        assertEquals(TypeMesure.GLYCEMIE, mesure.getTypeMesure());
        assertEquals(180.5, mesure.getValeur());
        assertEquals("mg/dL", mesure.getUnite());
        assertEquals(Source.CAPTEUR, mesure.getSource());
        assertEquals(now, mesure.getDateMesure());
    }
}
