package tn.esprit.patient.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.patient.dto.AlerteCreationDTO;
import tn.esprit.patient.dto.AlerteDTO;
import tn.esprit.patient.exception.ResourceNotFoundException;
import tn.esprit.patient.model.Alerte;
import tn.esprit.patient.model.NiveauRisque;
import tn.esprit.patient.model.SourceAlerte;
import tn.esprit.patient.repository.AlerteRepository;
import tn.esprit.patient.repository.PatientRepository;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AlerteServiceTest {

    @Mock
    private AlerteRepository alerteRepository;

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private AlerteServiceImpl alerteService;

    @Test
    @DisplayName("Should create alerte successfully")
    void testCreateAlerteSuccess() {
        AlerteCreationDTO dto = AlerteCreationDTO.builder()
                .patientId(1L)
                .niveauRisque(NiveauRisque.CRITIQUE)
                .source(SourceAlerte.SYMPTOME)
                .description("Palpitations intenses")
                .build();

        Alerte saved = Alerte.builder()
                .id(5L)
                .patientId(1L)
                .niveauRisque(NiveauRisque.CRITIQUE)
                .source(SourceAlerte.SYMPTOME)
                .description("Palpitations intenses")
                .traitee(false)
                .build();

        when(patientRepository.existsById(1L)).thenReturn(true);
        when(alerteRepository.save(any(Alerte.class))).thenReturn(saved);

        AlerteDTO result = alerteService.create(dto);

        assertNotNull(result);
        assertEquals(5L, result.getId());
        assertFalse(result.getTraitee());
    }

    @Test
    @DisplayName("Should mark alerte as traitee")
    void testMarkAsTraitee() {
        Alerte alerte = Alerte.builder()
                .id(10L)
                .patientId(1L)
                .niveauRisque(NiveauRisque.ELEVE)
                .source(SourceAlerte.SYMPTOME)
                .description("Tension haute")
                .traitee(false)
                .build();

        when(alerteRepository.findById(10L)).thenReturn(Optional.of(alerte));
        when(alerteRepository.save(any(Alerte.class))).thenAnswer(i -> i.getArgument(0));

        AlerteDTO updated = alerteService.markAsTraitee(10L);

        assertTrue(updated.getTraitee());
        verify(alerteRepository, times(1)).save(alerte);
    }
}