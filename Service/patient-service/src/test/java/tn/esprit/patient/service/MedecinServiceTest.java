package tn.esprit.patient.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.patient.dto.MedecinCreationDTO;
import tn.esprit.patient.dto.MedecinDTO;
import tn.esprit.patient.dto.PatientDTO;
import tn.esprit.patient.exception.ResourceNotFoundException;
import tn.esprit.patient.model.Medecin;
import tn.esprit.patient.model.NiveauRisque;
import tn.esprit.patient.model.Patient;
import tn.esprit.patient.repository.MedecinRepository;
import tn.esprit.patient.repository.PatientRepository;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MedecinServiceTest {

    @Mock
    private MedecinRepository medecinRepository;

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private MedecinServiceImpl medecinService;

    private Medecin sampleMedecin;

    @BeforeEach
    void setUp() {
        sampleMedecin = Medecin.builder()
                .id(1L)
                .userId(10L)
                .specialite("Cardiologie")
                .numeroOrdre("ORDRE123")
                .build();
    }

    @Test
    @DisplayName("create should save and return MedecinDTO when valid")
    void testCreateSuccess() {
        MedecinCreationDTO dto = MedecinCreationDTO.builder()
                .userId(10L)
                .specialite("Cardiologie")
                .numeroOrdre("ORDRE123")
                .build();

        when(medecinRepository.existsByUserId(10L)).thenReturn(false);
        when(medecinRepository.existsByNumeroOrdre("ORDRE123")).thenReturn(false);
        when(medecinRepository.save(any(Medecin.class))).thenReturn(sampleMedecin);

        MedecinDTO result = medecinService.create(dto);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("ORDRE123", result.getNumeroOrdre());
        verify(medecinRepository).save(any(Medecin.class));
    }

    @Test
    @DisplayName("create should throw when userId already exists")
    void testCreateDuplicateUserId() {
        MedecinCreationDTO dto = MedecinCreationDTO.builder().userId(10L).numeroOrdre("ORDRE123").build();
        when(medecinRepository.existsByUserId(10L)).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> medecinService.create(dto));
    }

    @Test
    @DisplayName("create should throw when numeroOrdre already exists")
    void testCreateDuplicateNumeroOrdre() {
        MedecinCreationDTO dto = MedecinCreationDTO.builder().userId(10L).numeroOrdre("ORDRE123").build();
        when(medecinRepository.existsByUserId(10L)).thenReturn(false);
        when(medecinRepository.existsByNumeroOrdre("ORDRE123")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> medecinService.create(dto));
    }

    @Test
    @DisplayName("getById should return MedecinDTO when found")
    void testGetByIdSuccess() {
        when(medecinRepository.findById(1L)).thenReturn(Optional.of(sampleMedecin));

        MedecinDTO result = medecinService.getById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    @DisplayName("getByUserId should return MedecinDTO when found")
    void testGetByUserIdSuccess() {
        when(medecinRepository.findByUserId(10L)).thenReturn(Optional.of(sampleMedecin));

        MedecinDTO result = medecinService.getByUserId(10L);

        assertNotNull(result);
        assertEquals(10L, result.getUserId());
    }

    @Test
    @DisplayName("getByUserId should throw ResourceNotFoundException when not found")
    void testGetByUserIdNotFound() {
        when(medecinRepository.findByUserId(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> medecinService.getByUserId(999L));
    }

    @Test
    @DisplayName("getAll should return list of MedecinDTO")
    void testGetAll() {
        when(medecinRepository.findAll()).thenReturn(List.of(sampleMedecin));

        List<MedecinDTO> result = medecinService.getAll();

        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("update should modify medecin when valid")
    void testUpdateSuccess() {
        MedecinDTO updateDTO = MedecinDTO.builder()
                .specialite("Neurologie")
                .numeroOrdre("ORDRE123")
                .build();

        when(medecinRepository.findById(1L)).thenReturn(Optional.of(sampleMedecin));
        when(medecinRepository.save(any(Medecin.class))).thenReturn(sampleMedecin);

        MedecinDTO result = medecinService.update(1L, updateDTO);

        assertNotNull(result);
        assertEquals("Neurologie", sampleMedecin.getSpecialite());
    }

    @Test
    @DisplayName("delete should remove medecin when exists")
    void testDeleteSuccess() {
        when(medecinRepository.existsById(1L)).thenReturn(true);

        medecinService.delete(1L);

        verify(medecinRepository).deleteById(1L);
    }

    @Test
    @DisplayName("delete should throw ResourceNotFoundException when not found")
    void testDeleteNotFound() {
        when(medecinRepository.existsById(999L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> medecinService.delete(999L));
    }

    @Test
    @DisplayName("getPatients with various filter combinations")
    void testGetPatientsFilters() {
        Patient patient = Patient.builder().id(100L).userId(200L).medecinId(1L).niveauRisque(NiveauRisque.MODERE).build();

        when(medecinRepository.existsById(1L)).thenReturn(true);

        // Filter: maladieId != null && niveauRisque != null
        when(patientRepository.findByMedecinIdAndMaladieIdAndNiveauRisque(1L, 5L, NiveauRisque.MODERE))
                .thenReturn(List.of(patient));
        List<PatientDTO> res1 = medecinService.getPatients(1L, 5L, NiveauRisque.MODERE);
        assertEquals(1, res1.size());

        // Filter: maladieId != null
        when(patientRepository.findByMedecinIdAndMaladieId(1L, 5L)).thenReturn(List.of(patient));
        List<PatientDTO> res2 = medecinService.getPatients(1L, 5L, null);
        assertEquals(1, res2.size());

        // Filter: niveauRisque != null
        when(patientRepository.findByMedecinIdAndNiveauRisque(1L, NiveauRisque.MODERE)).thenReturn(List.of(patient));
        List<PatientDTO> res3 = medecinService.getPatients(1L, null, NiveauRisque.MODERE);
        assertEquals(1, res3.size());

        // Filter: neither
        when(patientRepository.findByMedecinId(1L)).thenReturn(List.of(patient));
        List<PatientDTO> res4 = medecinService.getPatients(1L, null, null);
        assertEquals(1, res4.size());
    }
}
