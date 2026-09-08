package tn.esprit.patient.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import tn.esprit.patient.dto.PatientCreationDTO;
import tn.esprit.patient.dto.PatientDTO;
import tn.esprit.patient.exception.ResourceNotFoundException;
import tn.esprit.patient.model.NiveauRisque;
import tn.esprit.patient.model.Sexe;
import tn.esprit.patient.service.PatientService;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PatientController.class)
class PatientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PatientService patientService;

    @Test
    @DisplayName("POST /patients - Should return 201 Created and PatientDTO")
    void testCreatePatient() throws Exception {
        PatientCreationDTO creationDTO = PatientCreationDTO.builder()
                .userId(10L)
                .medecinId(1L)
                .dateNaissance(LocalDate.of(1990, 5, 10))
                .sexe(Sexe.M)
                .niveauRisque(NiveauRisque.FAIBLE)
                .build();

        PatientDTO resultDTO = PatientDTO.builder()
                .id(100L)
                .userId(10L)
                .medecinId(1L)
                .dateNaissance(creationDTO.getDateNaissance())
                .sexe(Sexe.M)
                .niveauRisque(NiveauRisque.FAIBLE)
                .build();

        when(patientService.create(any())).thenReturn(resultDTO);

        mockMvc.perform(post("/patients")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(creationDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100L))
                .andExpect(jsonPath("$.userId").value(10L))
                .andExpect(jsonPath("$.niveauRisque").value("FAIBLE"));
    }

    @Test
    @DisplayName("GET /patients/{id} - Should return 200 OK")
    void testGetPatientById() throws Exception {
        PatientDTO dto = PatientDTO.builder()
                .id(1L)
                .userId(10L)
                .medecinId(2L)
                .sexe(Sexe.F)
                .niveauRisque(NiveauRisque.ELEVE)
                .build();

        when(patientService.getById(1L)).thenReturn(dto);

        mockMvc.perform(get("/patients/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.niveauRisque").value("ELEVE"));
    }

    @Test
    @DisplayName("GET /patients/{id} - Should return 404 Not Found when missing")
    void testGetPatientByIdNotFound() throws Exception {
        when(patientService.getById(99L)).thenThrow(new ResourceNotFoundException("Patient not found"));

        mockMvc.perform(get("/patients/99"))
                .andExpect(status().isNotFound());
    }
}