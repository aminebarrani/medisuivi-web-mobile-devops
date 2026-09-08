package tn.esprit.patient.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import tn.esprit.patient.dto.SymptomeCreationDTO;
import tn.esprit.patient.dto.SymptomeDTO;
import tn.esprit.patient.model.Gravite;
import tn.esprit.patient.service.SymptomeService;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SymptomeController.class)
class SymptomeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SymptomeService symptomeService;

    @Test
    @DisplayName("POST /symptomes - Should create symptome and return 201")
    void testCreateSymptome() throws Exception {
        SymptomeCreationDTO creationDTO = SymptomeCreationDTO.builder()
                .patientId(1L)
                .description("Douleur articulaire")
                .gravite(Gravite.FAIBLE)
                .build();

        SymptomeDTO resultDTO = SymptomeDTO.builder()
                .id(30L)
                .patientId(1L)
                .description("Douleur articulaire")
                .gravite(Gravite.FAIBLE)
                .build();

        when(symptomeService.create(any())).thenReturn(resultDTO);

        mockMvc.perform(post("/symptomes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(creationDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(30L))
                .andExpect(jsonPath("$.description").value("Douleur articulaire"));
    }
}
