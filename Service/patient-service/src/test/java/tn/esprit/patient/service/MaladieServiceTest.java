package tn.esprit.patient.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.patient.dto.MaladieCreationDTO;
import tn.esprit.patient.dto.MaladieDTO;
import tn.esprit.patient.exception.ResourceNotFoundException;
import tn.esprit.patient.model.Maladie;
import tn.esprit.patient.repository.MaladieRepository;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MaladieServiceTest {

    @Mock
    private MaladieRepository maladieRepository;

    @InjectMocks
    private MaladieServiceImpl maladieService;

    private Maladie sampleMaladie;

    @BeforeEach
    void setUp() {
        sampleMaladie = Maladie.builder()
                .id(1L)
                .nom("Diabete Type 2")
                .description("Chronique")
                .parametresSuivis("Glycemie")
                .seuilMin(70.0)
                .seuilMax(140.0)
                .build();
    }

    @Test
    @DisplayName("create should save and return MaladieDTO when valid")
    void testCreateSuccess() {
        MaladieCreationDTO creationDTO = MaladieCreationDTO.builder()
                .nom("Diabete Type 2")
                .description("Chronique")
                .parametresSuivis("Glycemie")
                .seuilMin(70.0)
                .seuilMax(140.0)
                .build();

        when(maladieRepository.existsByNom("Diabete Type 2")).thenReturn(false);
        when(maladieRepository.save(any(Maladie.class))).thenReturn(sampleMaladie);

        MaladieDTO result = maladieService.create(creationDTO);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Diabete Type 2", result.getNom());
        verify(maladieRepository).save(any(Maladie.class));
    }

    @Test
    @DisplayName("create should throw IllegalArgumentException when name already exists")
    void testCreateDuplicateNom() {
        MaladieCreationDTO creationDTO = MaladieCreationDTO.builder()
                .nom("Diabete Type 2")
                .build();

        when(maladieRepository.existsByNom("Diabete Type 2")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> maladieService.create(creationDTO));
        verify(maladieRepository, never()).save(any());
    }

    @Test
    @DisplayName("getById should return MaladieDTO when found")
    void testGetByIdSuccess() {
        when(maladieRepository.findById(1L)).thenReturn(Optional.of(sampleMaladie));

        MaladieDTO result = maladieService.getById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    @DisplayName("getById should throw ResourceNotFoundException when not found")
    void testGetByIdNotFound() {
        when(maladieRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> maladieService.getById(999L));
    }

    @Test
    @DisplayName("getAll should return list of MaladieDTO")
    void testGetAll() {
        when(maladieRepository.findAll()).thenReturn(List.of(sampleMaladie));

        List<MaladieDTO> result = maladieService.getAll();

        assertEquals(1, result.size());
        assertEquals("Diabete Type 2", result.get(0).getNom());
    }

    @Test
    @DisplayName("update should save and return updated MaladieDTO")
    void testUpdateSuccess() {
        MaladieDTO updateDTO = MaladieDTO.builder()
                .id(1L)
                .nom("Diabete Modifie")
                .description("Desc")
                .parametresSuivis("Glycemie")
                .seuilMin(80.0)
                .seuilMax(150.0)
                .build();

        when(maladieRepository.findById(1L)).thenReturn(Optional.of(sampleMaladie));
        when(maladieRepository.existsByNom("Diabete Modifie")).thenReturn(false);
        when(maladieRepository.save(any(Maladie.class))).thenReturn(sampleMaladie);

        MaladieDTO result = maladieService.update(1L, updateDTO);

        assertNotNull(result);
        assertEquals("Diabete Modifie", sampleMaladie.getNom());
        verify(maladieRepository).save(sampleMaladie);
    }

    @Test
    @DisplayName("update should throw IllegalArgumentException when new name is taken")
    void testUpdateDuplicateNom() {
        MaladieDTO updateDTO = MaladieDTO.builder()
                .id(1L)
                .nom("Existing Name")
                .build();

        when(maladieRepository.findById(1L)).thenReturn(Optional.of(sampleMaladie));
        when(maladieRepository.existsByNom("Existing Name")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> maladieService.update(1L, updateDTO));
    }

    @Test
    @DisplayName("delete should remove maladie when exists")
    void testDeleteSuccess() {
        when(maladieRepository.existsById(1L)).thenReturn(true);

        maladieService.delete(1L);

        verify(maladieRepository).deleteById(1L);
    }

    @Test
    @DisplayName("delete should throw ResourceNotFoundException when not found")
    void testDeleteNotFound() {
        when(maladieRepository.existsById(999L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> maladieService.delete(999L));
        verify(maladieRepository, never()).deleteById(any());
    }
}
