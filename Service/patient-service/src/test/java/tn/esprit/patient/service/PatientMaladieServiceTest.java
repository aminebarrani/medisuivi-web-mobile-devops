package tn.esprit.patient.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.patient.dto.PatientMaladieCreationDTO;
import tn.esprit.patient.dto.PatientMaladieDTO;
import tn.esprit.patient.exception.ResourceNotFoundException;
import tn.esprit.patient.model.PatientMaladie;
import tn.esprit.patient.repository.MaladieRepository;
import tn.esprit.patient.repository.PatientMaladieRepository;
import tn.esprit.patient.repository.PatientRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientMaladieServiceTest {

    @Mock
    private PatientMaladieRepository patientMaladieRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private MaladieRepository maladieRepository;

    @InjectMocks
    private PatientMaladieServiceImpl patientMaladieService;

    private PatientMaladie samplePM;

    @BeforeEach
    void setUp() {
        samplePM = PatientMaladie.builder()
                .id(1L)
                .patientId(10L)
                .maladieId(20L)
                .dateDiagnostic(LocalDate.of(2023, 1, 15))
                .build();
    }

    @Test
    @DisplayName("create should save and return PatientMaladieDTO when valid")
    void testCreateSuccess() {
        PatientMaladieCreationDTO dto = PatientMaladieCreationDTO.builder()
                .patientId(10L)
                .maladieId(20L)
                .dateDiagnostic(LocalDate.of(2023, 1, 15))
                .build();

        when(patientRepository.existsById(10L)).thenReturn(true);
        when(maladieRepository.existsById(20L)).thenReturn(true);
        when(patientMaladieRepository.existsByPatientIdAndMaladieId(10L, 20L)).thenReturn(false);
        when(patientMaladieRepository.save(any(PatientMaladie.class))).thenReturn(samplePM);

        PatientMaladieDTO result = patientMaladieService.create(dto);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(10L, result.getPatientId());
        assertEquals(20L, result.getMaladieId());
    }

    @Test
    @DisplayName("create should throw ResourceNotFoundException when patient missing")
    void testCreatePatientMissing() {
        PatientMaladieCreationDTO dto = PatientMaladieCreationDTO.builder().patientId(99L).maladieId(20L).build();
        when(patientRepository.existsById(99L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> patientMaladieService.create(dto));
    }

    @Test
    @DisplayName("create should throw ResourceNotFoundException when maladie missing")
    void testCreateMaladieMissing() {
        PatientMaladieCreationDTO dto = PatientMaladieCreationDTO.builder().patientId(10L).maladieId(99L).build();
        when(patientRepository.existsById(10L)).thenReturn(true);
        when(maladieRepository.existsById(99L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> patientMaladieService.create(dto));
    }

    @Test
    @DisplayName("create should throw IllegalArgumentException when already assigned")
    void testCreateAlreadyAssigned() {
        PatientMaladieCreationDTO dto = PatientMaladieCreationDTO.builder().patientId(10L).maladieId(20L).build();
        when(patientRepository.existsById(10L)).thenReturn(true);
        when(maladieRepository.existsById(20L)).thenReturn(true);
        when(patientMaladieRepository.existsByPatientIdAndMaladieId(10L, 20L)).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> patientMaladieService.create(dto));
    }

    @Test
    @DisplayName("getById should return PatientMaladieDTO when found")
    void testGetByIdSuccess() {
        when(patientMaladieRepository.findById(1L)).thenReturn(Optional.of(samplePM));

        PatientMaladieDTO result = patientMaladieService.getById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    @DisplayName("getByPatientId should return list when patient exists")
    void testGetByPatientIdSuccess() {
        when(patientRepository.existsById(10L)).thenReturn(true);
        when(patientMaladieRepository.findByPatientId(10L)).thenReturn(List.of(samplePM));

        List<PatientMaladieDTO> result = patientMaladieService.getByPatientId(10L);

        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("getByMaladieId should return list when maladie exists")
    void testGetByMaladieIdSuccess() {
        when(maladieRepository.existsById(20L)).thenReturn(true);
        when(patientMaladieRepository.findByMaladieId(20L)).thenReturn(List.of(samplePM));

        List<PatientMaladieDTO> result = patientMaladieService.getByMaladieId(20L);

        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("update should modify dateDiagnostic")
    void testUpdateSuccess() {
        PatientMaladieDTO dto = PatientMaladieDTO.builder()
                .dateDiagnostic(LocalDate.of(2024, 5, 20))
                .build();

        when(patientMaladieRepository.findById(1L)).thenReturn(Optional.of(samplePM));
        when(patientMaladieRepository.save(any(PatientMaladie.class))).thenReturn(samplePM);

        PatientMaladieDTO result = patientMaladieService.update(1L, dto);

        assertNotNull(result);
        assertEquals(LocalDate.of(2024, 5, 20), samplePM.getDateDiagnostic());
    }

    @Test
    @DisplayName("delete should remove when exists")
    void testDeleteSuccess() {
        when(patientMaladieRepository.existsById(1L)).thenReturn(true);

        patientMaladieService.delete(1L);

        verify(patientMaladieRepository).deleteById(1L);
    }
}
