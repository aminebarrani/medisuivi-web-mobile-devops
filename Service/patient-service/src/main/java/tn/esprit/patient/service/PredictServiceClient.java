package tn.esprit.patient.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import tn.esprit.patient.dto.PredictRequestDTO;
import tn.esprit.patient.dto.PredictResponseDTO;
import tn.esprit.patient.model.*;
import tn.esprit.patient.repository.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class PredictServiceClient {

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

        PredictResponseDTO response = restTemplate.postForObject(url, requestPayload, PredictResponseDTO.class);

        if (response != null && response.getGravite() != null) {
            // Map FastAPI classification to local NiveauRisque
            NiveauRisque updatedRisque = mapToNiveauRisque(response.getGravite());
            patient.setNiveauRisque(updatedRisque);
            patientRepository.save(patient);
        }

        return response;
    }

    private PredictRequestDTO buildRequestPayload(Patient patient) {
        Long patientId = patient.getId();

        // 1. Age
        double age = ChronoUnit.YEARS.between(patient.getDateNaissance(), LocalDate.now());

        // 2. Sexe (M -> HOMME, F -> FEMME)
        String sexe = patient.getSexe() == Sexe.M ? "HOMME" : "FEMME";

        // 3. Disease & Jours depuis diagnostic
        String diseaseName = "DIABETE"; // Default fallback
        double joursDepuisDiagnostic = 0.0;
        Double seuilMinMaladie = null;
        Double seuilMaxMaladie = null;

        List<PatientMaladie> patientMaladies = patientMaladieRepository.findByPatientId(patientId);
        if (!patientMaladies.isEmpty()) {
            patientMaladies.sort((pm1, pm2) -> pm2.getDateDiagnostic().compareTo(pm1.getDateDiagnostic()));
            PatientMaladie latestPm = patientMaladies.get(0);
            Optional<Maladie> maladieOpt = maladieRepository.findById(latestPm.getMaladieId());
            if (maladieOpt.isPresent()) {
                Maladie m = maladieOpt.get();
                seuilMinMaladie = m.getSeuilMin();
                seuilMaxMaladie = m.getSeuilMax();
                diseaseName = normalizeDiseaseName(m.getNom());
            }
            joursDepuisDiagnostic = (double) ChronoUnit.DAYS.between(latestPm.getDateDiagnostic(), LocalDate.now());
        }

        // 4. Measurements & Rolling features per TypeMesure
        List<Mesure> allMesures = mesureRepository.findByPatientIdOrderByDateMesureDesc(patientId);
        double valeurMesureProche = 100.0; // default fallback
        double deviationScore = 0.0;
        double rollingMean14j = 100.0;
        double rollingStd14j = 0.0;
        double trendSlope14j = 0.0;

        if (!allMesures.isEmpty()) {
            TypeMesure targetType = determineTargetType(diseaseName, allMesures.get(0).getTypeMesure());
            
            // Filter measurements specifically for targetType
            List<Mesure> typeMesures = mesureRepository.findByPatientIdAndTypeMesureOrderByDateMesureDesc(patientId, targetType);
            if (typeMesures.isEmpty()) {
                // Fallback to latest measure's type
                targetType = allMesures.get(0).getTypeMesure();
                typeMesures = mesureRepository.findByPatientIdAndTypeMesureOrderByDateMesureDesc(patientId, targetType);
            }

            if (!typeMesures.isEmpty()) {
                Mesure latestMesure = typeMesures.get(0);
                valeurMesureProche = latestMesure.getValeur();

                // Calculate deviation score based on Maladie or TypeMesure thresholds
                double[] minMax = getThresholds(targetType, seuilMinMaladie, seuilMaxMaladie);
                double min = minMax[0];
                double max = minMax[1];
                if (valeurMesureProche < min) {
                    deviationScore = (min - valeurMesureProche) / min;
                } else if (valeurMesureProche > max) {
                    deviationScore = (valeurMesureProche - max) / max;
                }

                // Rolling statistics for the last 14 days (filtered by targetType)
                LocalDateTime cutoff = LocalDateTime.now().minusDays(14);
                List<Mesure> recentMesures = typeMesures.stream()
                        .filter(m -> m.getDateMesure() != null && m.getDateMesure().isAfter(cutoff))
                        .toList();

                if (recentMesures.isEmpty()) {
                    recentMesures = typeMesures.subList(0, Math.min(typeMesures.size(), 14));
                }

                if (!recentMesures.isEmpty()) {
                    double sum = 0.0;
                    for (Mesure m : recentMesures) {
                        sum += m.getValeur();
                    }
                    rollingMean14j = sum / recentMesures.size();

                    if (recentMesures.size() > 1) {
                        double varianceSum = 0.0;
                        for (Mesure m : recentMesures) {
                            varianceSum += Math.pow(m.getValeur() - rollingMean14j, 2);
                        }
                        rollingStd14j = Math.sqrt(varianceSum / (recentMesures.size() - 1));

                        List<Mesure> chronological = new ArrayList<>(recentMesures);
                        chronological.sort(Comparator.comparing(Mesure::getDateMesure));
                        Mesure first = chronological.get(0);
                        Mesure last = chronological.get(chronological.size() - 1);
                        double valDiff = last.getValeur() - first.getValeur();
                        double hoursDiff = ChronoUnit.HOURS.between(first.getDateMesure(), last.getDateMesure());
                        double daysDiff = hoursDiff / 24.0;
                        if (daysDiff > 0.01) {
                            trendSlope14j = valDiff / daysDiff;
                        } else {
                            trendSlope14j = valDiff;
                        }
                    } else {
                        rollingMean14j = valeurMesureProche;
                    }
                } else {
                    rollingMean14j = valeurMesureProche;
                }
            }
        }

        // 5. Symptoms reported in the last 7 days
        LocalDateTime symptomCutoff = LocalDateTime.now().minusDays(7);
        List<Symptome> symptomes = symptomeRepository.findByPatientIdOrderByDateSignalementDesc(patientId);
        double nbSymptomesRecents7j = (double) symptomes.stream()
                .filter(s -> s.getDateSignalement() != null && s.getDateSignalement().isAfter(symptomCutoff))
                .count();

        return PredictRequestDTO.builder()
                .age(age)
                .sexe(sexe)
                .disease(diseaseName)
                .joursDepuisDiagnostic(joursDepuisDiagnostic)
                .valeurMesureProche(valeurMesureProche)
                .deviationScore(deviationScore)
                .rollingMean14j(rollingMean14j)
                .rollingStd14j(rollingStd14j)
                .trendSlope14j(trendSlope14j)
                .nbSymptomesRecents7j(nbSymptomesRecents7j)
                .build();
    }

    private String normalizeDiseaseName(String rawNom) {
        if (rawNom == null) return "DIABETE";
        String upper = rawNom.toUpperCase();
        if (upper.contains("DIAB")) return "DIABETE";
        if (upper.contains("HYPER") || upper.contains("TENS")) return "HYPERTENSION";
        if (upper.contains("ASTH")) return "ASTHME";
        if (upper.contains("CARD") || upper.contains("INSUFF")) return "INSUFFISANCE_CARDIAQUE";
        return upper.replace(" ", "_");
    }

    private TypeMesure determineTargetType(String diseaseName, TypeMesure fallback) {
        switch (diseaseName) {
            case "DIABETE":
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
            case "FAIBLE":
                return NiveauRisque.FAIBLE;
            case "MODERE":
                return NiveauRisque.MODERE;
            case "GRAVE":
            default:
                return NiveauRisque.ELEVE;
        }
    }
}
