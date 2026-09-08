package tn.esprit.patient.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import tn.esprit.patient.dto.PredictRequestDTO;
import tn.esprit.patient.dto.PredictResponseDTO;
import tn.esprit.patient.model.*;
import tn.esprit.patient.repository.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PredictServiceClientTest {

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private PatientMaladieRepository patientMaladieRepository;

    @Mock
    private MaladieRepository maladieRepository;

    @Mock
    private MesureRepository mesureRepository;

    @Mock
    private SymptomeRepository symptomeRepository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private PredictServiceClient predictServiceClient;

    private Patient samplePatient;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(predictServiceClient, "restTemplate", restTemplate);
        ReflectionTestUtils.setField(predictServiceClient, "mlServiceUrl", "http://localhost:8000");

        samplePatient = Patient.builder()
                .id(1L)
                .userId(10L)
                .medecinId(2L)
                .dateNaissance(LocalDate.now(ZoneId.systemDefault()).minusYears(45))
                .sexe(Sexe.M)
                .niveauRisque(NiveauRisque.FAIBLE)
                .build();
    }

    @Test
    @DisplayName("predictRisk should succeed when ML service responds normally")
    void testPredictRiskWithMlServiceSuccess() {
        PredictResponseDTO mockResponse = PredictResponseDTO.builder()
                .gravite("MODERE")
                .probabilities(Map.of("FAIBLE", 0.1, "MODERE", 0.7, "GRAVE", 0.2))
                .build();

        when(patientRepository.findById(1L)).thenReturn(Optional.of(samplePatient));
        when(patientMaladieRepository.findByPatientId(1L)).thenReturn(Collections.emptyList());
        when(mesureRepository.findByPatientIdOrderByDateMesureDesc(1L)).thenReturn(Collections.emptyList());
        when(symptomeRepository.findByPatientIdOrderByDateSignalementDesc(1L)).thenReturn(Collections.emptyList());
        when(restTemplate.postForObject(anyString(), any(PredictRequestDTO.class), eq(PredictResponseDTO.class)))
                .thenReturn(mockResponse);

        PredictResponseDTO result = predictServiceClient.predictRisk(1L);

        assertNotNull(result);
        assertEquals("MODERE", result.getGravite());
        assertEquals(NiveauRisque.MODERE, samplePatient.getNiveauRisque());
        verify(patientRepository).save(samplePatient);
    }

    @Test
    @DisplayName("predictRisk should throw IllegalArgumentException when patient does not exist")
    void testPredictRiskPatientNotFound() {
        when(patientRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> predictServiceClient.predictRisk(999L));
    }

    @Test
    @DisplayName("predictRisk should fallback to clinical rules (GRAVE) when ML service fails and deviation is high")
    void testFallbackRuleBasedRiskGrave() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(samplePatient));

        Maladie diabete = Maladie.builder().id(100L).nom("Diabete de Type 2").seuilMin(70.0).seuilMax(140.0).build();
        PatientMaladie pm = PatientMaladie.builder()
                .id(50L).patientId(1L).maladieId(100L)
                .dateDiagnostic(LocalDate.now(ZoneId.systemDefault()).minusMonths(6))
                .build();

        when(patientMaladieRepository.findByPatientId(1L)).thenReturn(List.of(pm));
        when(maladieRepository.findById(100L)).thenReturn(Optional.of(diabete));

        // High measurement deviation (250 mg/dL > 140 max threshold => (250-140)/140 = 0.78 > 0.4)
        Mesure m1 = Mesure.builder().id(1L).patientId(1L).typeMesure(TypeMesure.GLYCEMIE).valeur(250.0)
                .dateMesure(LocalDateTime.now(ZoneId.systemDefault()).minusHours(2)).build();
        Mesure m2 = Mesure.builder().id(2L).patientId(1L).typeMesure(TypeMesure.GLYCEMIE).valeur(240.0)
                .dateMesure(LocalDateTime.now(ZoneId.systemDefault()).minusDays(1)).build();

        when(mesureRepository.findByPatientIdOrderByDateMesureDesc(1L)).thenReturn(List.of(m1, m2));
        when(mesureRepository.findByPatientIdAndTypeMesureOrderByDateMesureDesc(1L, TypeMesure.GLYCEMIE)).thenReturn(List.of(m1, m2));

        Symptome s1 = Symptome.builder().id(1L).patientId(1L).dateSignalement(LocalDateTime.now(ZoneId.systemDefault()).minusDays(1)).build();
        Symptome s2 = Symptome.builder().id(2L).patientId(1L).dateSignalement(LocalDateTime.now(ZoneId.systemDefault()).minusDays(2)).build();
        Symptome s3 = Symptome.builder().id(3L).patientId(1L).dateSignalement(LocalDateTime.now(ZoneId.systemDefault()).minusDays(3)).build();
        when(symptomeRepository.findByPatientIdOrderByDateSignalementDesc(1L)).thenReturn(List.of(s1, s2, s3));

        when(restTemplate.postForObject(anyString(), any(PredictRequestDTO.class), eq(PredictResponseDTO.class)))
                .thenThrow(new RestClientException("ML API timeout"));

        PredictResponseDTO result = predictServiceClient.predictRisk(1L);

        assertNotNull(result);
        assertEquals("GRAVE", result.getGravite());
        assertEquals(NiveauRisque.ELEVE, samplePatient.getNiveauRisque());
        verify(patientRepository).save(samplePatient);
    }

    @Test
    @DisplayName("predictRisk should fallback to clinical rules (MODERE) when deviation is moderate")
    void testFallbackRuleBasedRiskModere() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(samplePatient));
        when(patientMaladieRepository.findByPatientId(1L)).thenReturn(Collections.emptyList());

        Mesure m1 = Mesure.builder().id(1L).patientId(1L).typeMesure(TypeMesure.GLYCEMIE).valeur(170.0)
                .dateMesure(LocalDateTime.now(ZoneId.systemDefault()).minusHours(1)).build();
        when(mesureRepository.findByPatientIdOrderByDateMesureDesc(1L)).thenReturn(List.of(m1));
        when(mesureRepository.findByPatientIdAndTypeMesureOrderByDateMesureDesc(1L, TypeMesure.GLYCEMIE)).thenReturn(List.of(m1));
        when(symptomeRepository.findByPatientIdOrderByDateSignalementDesc(1L)).thenReturn(Collections.emptyList());

        when(restTemplate.postForObject(anyString(), any(), eq(PredictResponseDTO.class)))
                .thenThrow(new RestClientException("Connection refused"));

        PredictResponseDTO result = predictServiceClient.predictRisk(1L);

        assertNotNull(result);
        assertEquals("MODERE", result.getGravite());
        assertEquals(NiveauRisque.MODERE, samplePatient.getNiveauRisque());
    }

    @Test
    @DisplayName("predictRisk should fallback to clinical rules (FAIBLE) when measurements are normal")
    void testFallbackRuleBasedRiskFaible() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(samplePatient));
        when(patientMaladieRepository.findByPatientId(1L)).thenReturn(Collections.emptyList());

        Mesure m1 = Mesure.builder().id(1L).patientId(1L).typeMesure(TypeMesure.GLYCEMIE).valeur(100.0)
                .dateMesure(LocalDateTime.now(ZoneId.systemDefault()).minusHours(1)).build();
        when(mesureRepository.findByPatientIdOrderByDateMesureDesc(1L)).thenReturn(List.of(m1));
        when(mesureRepository.findByPatientIdAndTypeMesureOrderByDateMesureDesc(1L, TypeMesure.GLYCEMIE)).thenReturn(List.of(m1));
        when(symptomeRepository.findByPatientIdOrderByDateSignalementDesc(1L)).thenReturn(Collections.emptyList());

        when(restTemplate.postForObject(anyString(), any(), eq(PredictResponseDTO.class)))
                .thenReturn(null); // Null response triggers fallback

        PredictResponseDTO result = predictServiceClient.predictRisk(1L);

        assertNotNull(result);
        assertEquals("FAIBLE", result.getGravite());
        assertEquals(NiveauRisque.FAIBLE, samplePatient.getNiveauRisque());
    }

    @Test
    @DisplayName("normalizeDiseaseName and thresholds for Hypertension, Asthme, and Insuffisance Cardiaque")
    void testDiseaseNormalizationBranches() {
        samplePatient.setSexe(Sexe.F);
        when(patientRepository.findById(1L)).thenReturn(Optional.of(samplePatient));

        Maladie m1 = Maladie.builder().id(1L).nom("Hypertension arterielle").build();
        PatientMaladie pm1 = PatientMaladie.builder().patientId(1L).maladieId(1L).dateDiagnostic(LocalDate.now(ZoneId.systemDefault())).build();
        when(patientMaladieRepository.findByPatientId(1L)).thenReturn(List.of(pm1));
        when(maladieRepository.findById(1L)).thenReturn(Optional.of(m1));

        Mesure mesure = Mesure.builder().patientId(1L).typeMesure(TypeMesure.TENSION).valeur(120.0)
                .dateMesure(LocalDateTime.now(ZoneId.systemDefault()).minusDays(20)).build();
        when(mesureRepository.findByPatientIdOrderByDateMesureDesc(1L)).thenReturn(List.of(mesure));
        when(mesureRepository.findByPatientIdAndTypeMesureOrderByDateMesureDesc(1L, TypeMesure.TENSION)).thenReturn(List.of(mesure));
        when(symptomeRepository.findByPatientIdOrderByDateSignalementDesc(1L)).thenReturn(Collections.emptyList());

        when(restTemplate.postForObject(anyString(), any(), eq(PredictResponseDTO.class)))
                .thenThrow(new RestClientException("Offline"));

        PredictResponseDTO res = predictServiceClient.predictRisk(1L);
        assertNotNull(res);
        assertEquals("FAIBLE", res.getGravite());
    }
}
