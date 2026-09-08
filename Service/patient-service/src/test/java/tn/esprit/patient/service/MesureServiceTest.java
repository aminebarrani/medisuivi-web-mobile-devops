package tn.esprit.patient.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.patient.dto.MesureCreationDTO;
import tn.esprit.patient.dto.MesureDTO;
import tn.esprit.patient.exception.ResourceNotFoundException;
import tn.esprit.patient.model.Mesure;
import tn.esprit.patient.model.Source;
import tn.esprit.patient.model.TypeMesure;
import tn.esprit.patient.repository.MesureRepository;
import tn.esprit.patient.repository.PatientRepository;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MesureServiceTest {

    @Mock
    private MesureRepository mesureRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private PredictServiceClient predictServiceClient;

    @InjectMocks
    private MesureServiceImpl mesureService;

    @Test
    @DisplayName("Should save mesure successfully")
    void testCreateMesureSuccess() {
        MesureCreationDTO dto = MesureCreationDTO.builder()
                .patientId(2L)
                .typeMesure(TypeMesure.GLYCEMIE)
                .valeur(140.0)
                .unite("mg/dL")
                .source(Source.PATIENT)
                .build();

        Mesure saved = Mesure.builder()
                .id(50L)
                .patientId(2L)
                .typeMesure(TypeMesure.GLYCEMIE)
                .valeur(140.0)
                .unite("mg/dL")
                .source(Source.PATIENT)
                .build();

        when(patientRepository.existsById(2L)).thenReturn(true);
        when(mesureRepository.save(any(Mesure.class))).thenReturn(saved);

        MesureDTO result = mesureService.create(dto);

        assertNotNull(result);
        assertEquals(50L, result.getId());
        assertEquals(140.0, result.getValeur());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when patient not found")
    void testCreateMesurePatientNotFound() {
        MesureCreationDTO dto = MesureCreationDTO.builder().patientId(99L).build();

        when(patientRepository.existsById(99L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> mesureService.create(dto));
    }
}
