package tn.esprit.patient.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.patient.dto.PatientCreationDTO;
import tn.esprit.patient.dto.PatientDTO;
import tn.esprit.patient.exception.ResourceNotFoundException;
import tn.esprit.patient.model.NiveauRisque;
import tn.esprit.patient.model.Patient;
import tn.esprit.patient.model.Sexe;
import tn.esprit.patient.repository.MedecinRepository;
import tn.esprit.patient.repository.PatientRepository;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private MedecinRepository medecinRepository;

    @Mock
    private PredictServiceClient predictServiceClient;

    @InjectMocks
    private PatientServiceImpl patientService;

    @Test
    @DisplayName("Should create patient successfully when patient does not exist")
    void testCreatePatientSuccess() {
        PatientCreationDTO dto = PatientCreationDTO.builder()
                .userId(100L)
                .medecinId(1L)
                .dateNaissance(LocalDate.of(1995, 4, 10))
                .sexe(Sexe.M)
                .niveauRisque(NiveauRisque.FAIBLE)
                .build();

        Patient saved = Patient.builder()
                .id(10L)
                .userId(100L)
                .medecinId(1L)
                .dateNaissance(dto.getDateNaissance())
                .sexe(dto.getSexe())
                .niveauRisque(NiveauRisque.FAIBLE)
                .build();

        when(patientRepository.existsByUserId(100L)).thenReturn(false);
        when(medecinRepository.existsById(1L)).thenReturn(true);
        when(patientRepository.save(any(Patient.class))).thenReturn(saved);

        PatientDTO result = patientService.create(dto);

        assertNotNull(result);
        assertEquals(10L, result.getId());
        assertEquals(100L, result.getUserId());
        verify(patientRepository, times(1)).save(any(Patient.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when patient userId already exists")
    void testCreatePatientAlreadyExists() {
        PatientCreationDTO dto = PatientCreationDTO.builder()
                .userId(100L)
                .medecinId(1L)
                .build();

        when(patientRepository.existsByUserId(100L)).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> patientService.create(dto));
        verify(patientRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when patient ID is missing")
    void testGetByIdNotFound() {
        when(patientRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> patientService.getById(999L));
    }
}