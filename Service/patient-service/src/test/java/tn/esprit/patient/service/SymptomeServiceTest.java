package tn.esprit.patient.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.patient.dto.SymptomeCreationDTO;
import tn.esprit.patient.dto.SymptomeDTO;
import tn.esprit.patient.exception.ResourceNotFoundException;
import tn.esprit.patient.model.Gravite;
import tn.esprit.patient.model.Symptome;
import tn.esprit.patient.repository.PatientRepository;
import tn.esprit.patient.repository.SymptomeRepository;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SymptomeServiceTest {

    @Mock
    private SymptomeRepository symptomeRepository;

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private SymptomeServiceImpl symptomeService;

    @Test
    @DisplayName("Should create symptome successfully")
    void testCreateSymptomeSuccess() {
        SymptomeCreationDTO dto = SymptomeCreationDTO.builder()
                .patientId(1L)
                .description("Essoufflement au repos")
                .gravite(Gravite.GRAVE)
                .build();

        Symptome saved = Symptome.builder()
                .id(15L)
                .patientId(1L)
                .description("Essoufflement au repos")
                .gravite(Gravite.GRAVE)
                .build();

        when(patientRepository.existsById(1L)).thenReturn(true);
        when(symptomeRepository.save(any(Symptome.class))).thenReturn(saved);

        SymptomeDTO result = symptomeService.create(dto);

        assertNotNull(result);
        assertEquals(15L, result.getId());
        assertEquals("Essoufflement au repos", result.getDescription());
    }
}
