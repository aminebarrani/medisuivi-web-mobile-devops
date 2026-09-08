package tn.esprit.patient.repository;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import tn.esprit.patient.model.Mesure;
import tn.esprit.patient.model.Source;
import tn.esprit.patient.model.TypeMesure;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class MesureRepositoryTest {

    @Autowired
    private MesureRepository mesureRepository;

    @Test
    @DisplayName("Should find mesures by patientId and type")
    void testMesureQueries() {
        Mesure m1 = Mesure.builder()
                .patientId(200L)
                .typeMesure(TypeMesure.GLYCEMIE)
                .valeur(120.0)
                .unite("mg/dL")
                .source(Source.PATIENT)
                .build();

        Mesure m2 = Mesure.builder()
                .patientId(200L)
                .typeMesure(TypeMesure.TENSION)
                .valeur(130.0)
                .unite("mmHg")
                .source(Source.PATIENT)
                .build();

        mesureRepository.save(m1);
        mesureRepository.save(m2);

        List<Mesure> all = mesureRepository.findByPatientIdOrderByDateMesureDesc(200L);
        assertEquals(2, all.size());

        List<Mesure> glycemies = mesureRepository.findByPatientIdAndTypeMesureOrderByDateMesureDesc(200L, TypeMesure.GLYCEMIE);
        assertEquals(1, glycemies.size());
        assertEquals(120.0, glycemies.get(0).getValeur());
    }
}
