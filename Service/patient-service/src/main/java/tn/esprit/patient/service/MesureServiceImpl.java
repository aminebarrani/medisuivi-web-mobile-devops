package tn.esprit.patient.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.patient.dto.MesureCreationDTO;
import tn.esprit.patient.dto.MesureDTO;
import tn.esprit.patient.exception.ResourceNotFoundException;
import tn.esprit.patient.model.Mesure;
import tn.esprit.patient.model.Patient;
import tn.esprit.patient.repository.MesureRepository;
import tn.esprit.patient.repository.PatientRepository;

import java.util.List;

@Service
@Transactional
public class MesureServiceImpl implements MesureService {

    private static final Logger log = LoggerFactory.getLogger(MesureServiceImpl.class);

    private final MesureRepository mesureRepository;
    private final PatientRepository patientRepository;
    private final PredictServiceClient predictServiceClient;

    public MesureServiceImpl(MesureRepository mesureRepository,
                             PatientRepository patientRepository,
                             PredictServiceClient predictServiceClient) {
        this.mesureRepository = mesureRepository;
        this.patientRepository = patientRepository;
        this.predictServiceClient = predictServiceClient;
    }

    @Override
    public MesureDTO create(MesureCreationDTO dto) {
        if (!patientRepository.existsById(dto.getPatientId())) {
            throw new ResourceNotFoundException("Patient not found with id: " + dto.getPatientId());
        }

        Mesure mesure = Mesure.builder()
                .patientId(dto.getPatientId())
                .typeMesure(dto.getTypeMesure())
                .valeur(dto.getValeur())
                .unite(dto.getUnite())
                .source(dto.getSource())
                .build();

        Mesure savedMesure = mesureRepository.save(mesure);
        mesureRepository.flush();

        // Auto-recalculate patient risk in real-time
        try {
            predictServiceClient.predictRisk(dto.getPatientId());
        } catch (Exception e) {
            // Log or ignore ML service connection errors so measurement saving succeeds
            log.error("Could not auto-predict risk for patient {}: {}", dto.getPatientId(), e.getMessage());
        }

        return mapToDTO(savedMesure);
    }

    @Override
    @Transactional(readOnly = true)
    public MesureDTO getById(Long id) {
        Mesure mesure = mesureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mesure not found with id: " + id));
        return mapToDTO(mesure);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MesureDTO> getByPatientId(Long patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }
        return mesureRepository.findByPatientIdOrderByDateMesureDesc(patientId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MesureDTO> getByMedecinId(Long medecinId) {
        List<Long> patientIds = patientRepository.findByMedecinId(medecinId).stream()
                .map(Patient::getId)
                .toList();
        if (patientIds.isEmpty()) {
            return List.of();
        }
        return mesureRepository.findByPatientIdInOrderByDateMesureDesc(patientIds).stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public void delete(Long id) {
        if (!mesureRepository.existsById(id)) {
            throw new ResourceNotFoundException("Mesure not found with id: " + id);
        }
        mesureRepository.deleteById(id);
    }

    private MesureDTO mapToDTO(Mesure mesure) {
        return MesureDTO.builder()
                .id(mesure.getId())
                .patientId(mesure.getPatientId())
                .typeMesure(mesure.getTypeMesure())
                .valeur(mesure.getValeur())
                .unite(mesure.getUnite())
                .source(mesure.getSource())
                .dateMesure(mesure.getDateMesure())
                .build();
    }
}
