package tn.esprit.patient.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import tn.esprit.patient.dto.MesureCreationDTO;
import tn.esprit.patient.dto.MesureDTO;
import tn.esprit.patient.model.Source;
import tn.esprit.patient.model.TypeMesure;
import tn.esprit.patient.service.MesureService;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MesureController.class)
class MesureControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MesureService mesureService;

    @Test
    @DisplayName("POST /mesures - Should create mesure and return 201")
    void testCreateMesure() throws Exception {
        MesureCreationDTO creationDTO = MesureCreationDTO.builder()
                .patientId(1L)
                .typeMesure(TypeMesure.GLYCEMIE)
                .valeur(115.0)
                .unite("mg/dL")
                .source(Source.PATIENT)
                .build();

        MesureDTO resultDTO = MesureDTO.builder()
                .id(20L)
                .patientId(1L)
                .typeMesure(TypeMesure.GLYCEMIE)
                .valeur(115.0)
                .unite("mg/dL")
                .source(Source.PATIENT)
                .build();

        when(mesureService.create(any())).thenReturn(resultDTO);

        mockMvc.perform(post("/mesures")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(creationDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(20L))
                .andExpect(jsonPath("$.valeur").value(115.0));
    }
}
