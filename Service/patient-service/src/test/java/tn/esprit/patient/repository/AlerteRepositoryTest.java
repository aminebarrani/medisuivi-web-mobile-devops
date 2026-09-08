package tn.esprit.patient.repository;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import tn.esprit.patient.model.Alerte;
import tn.esprit.patient.model.NiveauRisque;
import tn.esprit.patient.model.SourceAlerte;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class AlerteRepositoryTest {

    @Autowired
    private AlerteRepository alerteRepository;

    @Test
    @DisplayName("Should find alertes by patientId and by traitee status")
    void testAlerteRepositoryQueries() {
        Alerte a1 = Alerte.builder()
                .patientId(100L)
                .niveauRisque(NiveauRisque.ELEVE)
                .source(SourceAlerte.SYMPTOME)
                .description("Alerte 1")
                .traitee(false)
                .build();

        Alerte a2 = Alerte.builder()
                .patientId(100L)
                .niveauRisque(NiveauRisque.CRITIQUE)
                .source(SourceAlerte.MESURE)
                .description("Alerte 2")
                .traitee(true)
                .build();

        alerteRepository.save(a1);
        alerteRepository.save(a2);

        List<Alerte> patientAlertes = alerteRepository.findByPatientIdOrderByDateCreationDesc(100L);
        assertEquals(2, patientAlertes.size());

        List<Alerte> nonTraitees = alerteRepository.findByTraiteeOrderByDateCreationDesc(false);
        assertEquals(1, nonTraitees.size());
        assertEquals("Alerte 1", nonTraitees.get(0).getDescription());
    }
}