package tn.esprit.patient.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import tn.esprit.patient.dto.AlerteCreationDTO;
import tn.esprit.patient.dto.AlerteDTO;
import tn.esprit.patient.model.NiveauRisque;
import tn.esprit.patient.model.SourceAlerte;
import tn.esprit.patient.service.AlerteService;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AlerteController.class)
class AlerteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AlerteService alerteService;

    @Test
    @DisplayName("POST /alertes - Should create alerte and return 201")
    void testCreateAlerte() throws Exception {
        AlerteCreationDTO creationDTO = AlerteCreationDTO.builder()
                .patientId(1L)
                .niveauRisque(NiveauRisque.CRITIQUE)
                .source(SourceAlerte.SYMPTOME)
                .description("Grave crise d'asthme")
                .build();

        AlerteDTO resultDTO = AlerteDTO.builder()
                .id(10L)
                .patientId(1L)
                .niveauRisque(NiveauRisque.CRITIQUE)
                .source(SourceAlerte.SYMPTOME)
                .description("Grave crise d'asthme")
                .traitee(false)
                .build();

        when(alerteService.create(any())).thenReturn(resultDTO);

        mockMvc.perform(post("/alertes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(creationDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10L))
                .andExpect(jsonPath("$.traitee").value(false));
    }

    @Test
    @DisplayName("PATCH /alertes/{id}/traiter - Should mark as traitee")
    void testMarkAsTraitee() throws Exception {
        AlerteDTO resultDTO = AlerteDTO.builder()
                .id(10L)
                .traitee(true)
                .build();

        when(alerteService.markAsTraitee(10L)).thenReturn(resultDTO);

        mockMvc.perform(patch("/alertes/10/traiter"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.traitee").value(true));
    }
}