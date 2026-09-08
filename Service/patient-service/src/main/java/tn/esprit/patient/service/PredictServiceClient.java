package tn.esprit.patient.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import tn.esprit.patient.dto.PredictRequestDTO;
import tn.esprit.patient.dto.PredictResponseDTO;
import tn.esprit.patient.model.*;
import tn.esprit.patient.repository.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class PredictServiceClient {

    private static final Logger log = LoggerFactory.getLogger(PredictServiceClient.class);

    private static final String GRAVITE_FAIBLE = "FAIBLE";
    private static final String GRAVITE_MODERE = "MODERE";
    private static final String GRAVITE_GRAVE = "GRAVE";
    private static final String DISEASE_DIABETE = "DIABETE";

    private final PatientRepository patientRepository;
    private final PatientMaladieRepository patientMaladieRepository;
    private final MaladieRepository maladieRepository;
    private final MesureRepository mesureRepository;
    private final SymptomeRepository symptomeRepository;
    private final RestTemplate restTemplate;

    @Value("${ml.service.url:http://localhost:8000}")
    private String mlServiceUrl;

    public PredictServiceClient(PatientRepository patientRepository,
                                PatientMaladieRepository patientMaladieRepository,
                                MaladieRepository maladieRepository,
                                MesureRepository mesureRepository,
                                SymptomeRepository symptomeRepository) {
        this.patientRepository = patientRepository;
        this.patientMaladieRepository = patientMaladieRepository;
        this.maladieRepository = maladieRepository;
        this.mesureRepository = mesureRepository;
        this.symptomeRepository = symptomeRepository;
        this.restTemplate = new RestTemplate();
    }

    public PredictResponseDTO predictRisk(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found with id: " + patientId));

        PredictRequestDTO requestPayload = buildRequestPayload(patient);
        String url = mlServiceUrl + "/predict";

        try {
            PredictResponseDTO response = restTemplate.postForObject(url, requestPayload, PredictResponseDTO.class);

            if (response != null && response.getGravite() != null) {
                // Map FastAPI classification to local NiveauRisque
                NiveauRisque updatedRisque = mapToNiveauRisque(response.getGravite());
                patient.setNiveauRisque(updatedRisque);
                patientRepository.save(patient);
                return response;
            }
        } catch (Exception e) {
            log.warn("Predict service connection/execution note: {} - Falling back to clinical rule-based evaluation.", e.getMessage());
        }

        // Clinical heuristic evaluation fallback when ML service is unavailable or error occurs
        return evaluateRuleBasedRisk(patient, requestPayload);
    }

    private PredictResponseDTO evaluateRuleBasedRisk(Patient patient, PredictRequestDTO payload) {
        double dev = payload.getDeviationScore();
        double symptoms = payload.getNbSymptomesRecents7j();
        String gravite;
        Map<String, Double> probs = new HashMap<>();

        if (dev > 0.4 || symptoms >= 3) {
            gravite = GRAVITE_GRAVE;
            probs.put(GRAVITE_FAIBLE, 0.05);
            probs.put(GRAVITE_MODERE, 0.25);
            probs.put(GRAVITE_GRAVE, 0.70);
        } else if (dev > 0.15 || symptoms >= 1) {
            gravite = GRAVITE_MODERE;
            probs.put(GRAVITE_FAIBLE, 0.20);
            probs.put(GRAVITE_MODERE, 0.65);
            probs.put(GRAVITE_GRAVE, 0.15);
        } else {
            gravite = GRAVITE_FAIBLE;
            probs.put(GRAVITE_FAIBLE, 0.85);
            probs.put(GRAVITE_MODERE, 0.12);
            probs.put(GRAVITE_GRAVE, 0.03);
        }

        NiveauRisque updatedRisque = mapToNiveauRisque(gravite);
        patient.setNiveauRisque(updatedRisque);
        patientRepository.save(patient);

        return PredictResponseDTO.builder()
                .gravite(gravite)
                .probabilities(probs)
                .build();
    }


    private PredictRequestDTO buildRequestPayload(Patient patient) {
        double age = ChronoUnit.YEARS.between(patient.getDateNaissance(), LocalDate.now(ZoneId.systemDefault()));
        String sexe = patient.getSexe() == Sexe.M ? "HOMME" : "FEMME";

        DiseaseInfo diseaseInfo = extractDiseaseInfo(patient.getId());
        MeasurementStats stats = extractMeasurementStats(patient.getId(), diseaseInfo);
        double nbSymptomesRecents7j = countRecentSymptoms(patient.getId());

        return PredictRequestDTO.builder()
                .age(age)
                .sexe(sexe)
                .disease(diseaseInfo.name)
                .joursDepuisDiagnostic(diseaseInfo.daysSinceDiagnosis)
                .valeurMesureProche(stats.valeurMesureProche)
                .deviationScore(stats.deviationScore)
                .rollingMean14j(stats.rollingMean14j)
                .rollingStd14j(stats.rollingStd14j)
                .trendSlope14j(stats.trendSlope14j)
                .nbSymptomesRecents7j(nbSymptomesRecents7j)
                .build();
    }

    private DiseaseInfo extractDiseaseInfo(Long patientId) {
        List<PatientMaladie> patientMaladies = patientMaladieRepository.findByPatientId(patientId);
        if (patientMaladies.isEmpty()) {
            return new DiseaseInfo(DISEASE_DIABETE, 0.0, null, null);
        }

        patientMaladies.sort((pm1, pm2) -> pm2.getDateDiagnostic().compareTo(pm1.getDateDiagnostic()));
        PatientMaladie latestPm = patientMaladies.get(0);
        Optional<Maladie> maladieOpt = maladieRepository.findById(latestPm.getMaladieId());

        String diseaseName = DISEASE_DIABETE;
        Double minThreshold = null;
        Double maxThreshold = null;

        if (maladieOpt.isPresent()) {
            Maladie m = maladieOpt.get();
            minThreshold = m.getSeuilMin();
            maxThreshold = m.getSeuilMax();
            diseaseName = normalizeDiseaseName(m.getNom());
        }

        double daysSince = ChronoUnit.DAYS.between(latestPm.getDateDiagnostic(), LocalDate.now(ZoneId.systemDefault()));
        return new DiseaseInfo(diseaseName, daysSince, minThreshold, maxThreshold);
    }

    private MeasurementStats extractMeasurementStats(Long patientId, DiseaseInfo diseaseInfo) {
        List<Mesure> allMesures = mesureRepository.findByPatientIdOrderByDateMesureDesc(patientId);
        if (allMesures.isEmpty()) {
            return MeasurementStats.defaultStats();
        }

        TypeMesure targetType = determineTargetType(diseaseInfo.name, allMesures.get(0).getTypeMesure());
        List<Mesure> typeMesures = mesureRepository.findByPatientIdAndTypeMesureOrderByDateMesureDesc(patientId, targetType);
        if (typeMesures.isEmpty()) {
            targetType = allMesures.get(0).getTypeMesure();
            typeMesures = mesureRepository.findByPatientIdAndTypeMesureOrderByDateMesureDesc(patientId, targetType);
        }

        if (typeMesures.isEmpty()) {
            return MeasurementStats.defaultStats();
        }

        Mesure latestMesure = typeMesures.get(0);
        double valeurMesureProche = latestMesure.getValeur();
        double deviationScore = calculateDeviation(valeurMesureProche, targetType, diseaseInfo.minThreshold, diseaseInfo.maxThreshold);

        return calculateRollingStats(typeMesures, valeurMesureProche, deviationScore);
    }

    private double calculateDeviation(double value, TypeMesure targetType, Double minThreshold, Double maxThreshold) {
        double[] minMax = getThresholds(targetType, minThreshold, maxThreshold);
        double min = minMax[0];
        double max = minMax[1];
        if (value < min) {
            return (min - value) / min;
        } else if (value > max) {
            return (value - max) / max;
        }
        return 0.0;
    }

    private MeasurementStats calculateRollingStats(List<Mesure> typeMesures, double latestValue, double deviationScore) {
        LocalDateTime cutoff = LocalDateTime.now(ZoneId.systemDefault()).minusDays(14);
        List<Mesure> recentMesures = typeMesures.stream()
                .filter(m -> m.getDateMesure() != null && m.getDateMesure().isAfter(cutoff))
                .toList();

        if (recentMesures.isEmpty()) {
            recentMesures = typeMesures.subList(0, Math.min(typeMesures.size(), 14));
        }

        if (recentMesures.isEmpty()) {
            return new MeasurementStats(latestValue, deviationScore, latestValue, 0.0, 0.0);
        }

        double sum = 0.0;
        for (Mesure m : recentMesures) {
            sum += m.getValeur();
        }
        double rollingMean = sum / recentMesures.size();

        if (recentMesures.size() <= 1) {
            return new MeasurementStats(latestValue, deviationScore, rollingMean, 0.0, 0.0);
        }

        double rollingStd = calculateStandardDeviation(recentMesures, rollingMean);
        double trendSlope = calculateTrendSlope(recentMesures);

        return new MeasurementStats(latestValue, deviationScore, rollingMean, rollingStd, trendSlope);
    }

    private double calculateStandardDeviation(List<Mesure> mesures, double mean) {
        double varianceSum = 0.0;
        for (Mesure m : mesures) {
            varianceSum += Math.pow(m.getValeur() - mean, 2);
        }
        return Math.sqrt(varianceSum / (mesures.size() - 1));
    }

    private double calculateTrendSlope(List<Mesure> mesures) {
        List<Mesure> chronological = new ArrayList<>(mesures);
        chronological.sort(Comparator.comparing(Mesure::getDateMesure));
        Mesure first = chronological.get(0);
        Mesure last = chronological.get(chronological.size() - 1);
        double valDiff = last.getValeur() - first.getValeur();
        double hoursDiff = ChronoUnit.HOURS.between(first.getDateMesure(), last.getDateMesure());
        double daysDiff = hoursDiff / 24.0;
        return daysDiff > 0.01 ? valDiff / daysDiff : valDiff;
    }

    private double countRecentSymptoms(Long patientId) {
        LocalDateTime symptomCutoff = LocalDateTime.now(ZoneId.systemDefault()).minusDays(7);
        List<Symptome> symptomes = symptomeRepository.findByPatientIdOrderByDateSignalementDesc(patientId);
        return symptomes.stream()
                .filter(s -> s.getDateSignalement() != null && s.getDateSignalement().isAfter(symptomCutoff))
                .count();
    }

    private String normalizeDiseaseName(String rawNom) {
        if (rawNom == null) return DISEASE_DIABETE;
        String upper = rawNom.toUpperCase();
        if (upper.contains("DIAB")) return DISEASE_DIABETE;
        if (upper.contains("HYPER") || upper.contains("TENS")) return "HYPERTENSION";
        if (upper.contains("ASTH")) return "ASTHME";
        if (upper.contains("CARD") || upper.contains("INSUFF") || upper.contains("COEUR")) return "INSUFFISANCE_CARDIAQUE";
        return DISEASE_DIABETE;
    }

    private TypeMesure determineTargetType(String diseaseName, TypeMesure fallback) {
        switch (diseaseName) {
            case DISEASE_DIABETE:
                return TypeMesure.GLYCEMIE;
            case "HYPERTENSION":
                return TypeMesure.TENSION;
            case "ASTHME":
                return TypeMesure.SPO2;
            case "INSUFFISANCE_CARDIAQUE":
                return TypeMesure.FREQUENCE_CARDIAQUE;
            default:
                return fallback != null ? fallback : TypeMesure.GLYCEMIE;
        }
    }

    private double[] getThresholds(TypeMesure type, Double customMin, Double customMax) {
        if (customMin != null && customMax != null) {
            return new double[]{customMin, customMax};
        }
        if (type == null) return new double[]{70.0, 140.0};
        switch (type) {
            case GLYCEMIE:
                return new double[]{70.0, 140.0};
            case TENSION:
                return new double[]{90.0, 140.0};
            case SPO2:
                return new double[]{95.0, 100.0};
            case FREQUENCE_CARDIAQUE:
                return new double[]{60.0, 100.0};
            case TEMPERATURE:
                return new double[]{36.5, 37.5};
            case POIDS:
                return new double[]{50.0, 100.0};
            default:
                return new double[]{70.0, 140.0};
        }
    }

    private NiveauRisque mapToNiveauRisque(String gravite) {
        switch (gravite.toUpperCase()) {
            case GRAVITE_FAIBLE:
                return NiveauRisque.FAIBLE;
            case GRAVITE_MODERE:
                return NiveauRisque.MODERE;
            case GRAVITE_GRAVE:
            default:
                return NiveauRisque.ELEVE;
        }
    }

    private static class DiseaseInfo {
        final String name;
        final double daysSinceDiagnosis;
        final Double minThreshold;
        final Double maxThreshold;

        DiseaseInfo(String name, double daysSinceDiagnosis, Double minThreshold, Double maxThreshold) {
            this.name = name;
            this.daysSinceDiagnosis = daysSinceDiagnosis;
            this.minThreshold = minThreshold;
            this.maxThreshold = maxThreshold;
        }
    }

    private static class MeasurementStats {
        final double valeurMesureProche;
        final double deviationScore;
        final double rollingMean14j;
        final double rollingStd14j;
        final double trendSlope14j;

        MeasurementStats(double valeurMesureProche, double deviationScore, double rollingMean14j, double rollingStd14j, double trendSlope14j) {
            this.valeurMesureProche = valeurMesureProche;
            this.deviationScore = deviationScore;
            this.rollingMean14j = rollingMean14j;
            this.rollingStd14j = rollingStd14j;
            this.trendSlope14j = trendSlope14j;
        }

        static MeasurementStats defaultStats() {
            return new MeasurementStats(100.0, 0.0, 100.0, 0.0, 0.0);
        }
    }
}
