package tn.esprit.patient.repository;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import tn.esprit.patient.model.Gravite;
import tn.esprit.patient.model.Symptome;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class SymptomeRepositoryTest {

    @Autowired
    private SymptomeRepository symptomeRepository;

    @Test
    @DisplayName("Should save symptome and find by patientId")
    void testSymptomeQueries() {
        Symptome s = Symptome.builder()
                .patientId(300L)
                .description("Vertiges le soir")
                .gravite(Gravite.MODERE)
                .build();

        symptomeRepository.save(s);

        List<Symptome> result = symptomeRepository.findByPatientIdOrderByDateSignalementDesc(300L);
        assertEquals(1, result.size());
        assertEquals("Vertiges le soir", result.get(0).getDescription());
    }
}
