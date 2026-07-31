package tn.esprit.patient.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.patient.dto.AlerteCreationDTO;
import tn.esprit.patient.dto.AlerteDTO;
import tn.esprit.patient.exception.ResourceNotFoundException;
import tn.esprit.patient.model.Alerte;
import tn.esprit.patient.model.Patient;
import tn.esprit.patient.repository.AlerteRepository;
import tn.esprit.patient.repository.PatientRepository;

import java.util.List;

@Service
@Transactional
public class AlerteServiceImpl implements AlerteService {

    private final AlerteRepository alerteRepository;
    private final PatientRepository patientRepository;

    public AlerteServiceImpl(AlerteRepository alerteRepository, PatientRepository patientRepository) {
        this.alerteRepository = alerteRepository;
        this.patientRepository = patientRepository;
    }

    @Override
    public AlerteDTO create(AlerteCreationDTO dto) {
        if (!patientRepository.existsById(dto.getPatientId())) {
            throw new ResourceNotFoundException("Patient not found with id: " + dto.getPatientId());
        }

        Alerte alerte = Alerte.builder()
                .patientId(dto.getPatientId())
                .niveauRisque(dto.getNiveauRisque())
                .source(dto.getSource())
                .description(dto.getDescription())
                .traitee(false)
                .build();

        return mapToDTO(alerteRepository.save(alerte));
    }

    @Override
    @Transactional(readOnly = true)
    public AlerteDTO getById(Long id) {
        Alerte alerte = alerteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alerte not found with id: " + id));
        return mapToDTO(alerte);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AlerteDTO> getByPatientId(Long patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }
        return alerteRepository.findByPatientIdOrderByDateCreationDesc(patientId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AlerteDTO> getByMedecinId(Long medecinId) {
        List<Long> patientIds = patientRepository.findByMedecinId(medecinId).stream()
                .map(Patient::getId)
                .toList();
        if (patientIds.isEmpty()) {
            return List.of();
        }
        return alerteRepository.findByPatientIdInOrderByDateCreationDesc(patientIds).stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AlerteDTO> getByTraitee(Boolean traitee) {
        return alerteRepository.findByTraiteeOrderByDateCreationDesc(traitee).stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public AlerteDTO markAsTraitee(Long id) {
        Alerte alerte = alerteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alerte not found with id: " + id));
        alerte.setTraitee(true);
        return mapToDTO(alerteRepository.save(alerte));
    }

    @Override
    public void delete(Long id) {
        if (!alerteRepository.existsById(id)) {
            throw new ResourceNotFoundException("Alerte not found with id: " + id);
        }
        alerteRepository.deleteById(id);
    }

    private AlerteDTO mapToDTO(Alerte alerte) {
        return AlerteDTO.builder()
                .id(alerte.getId())
                .patientId(alerte.getPatientId())
                .niveauRisque(alerte.getNiveauRisque())
                .source(alerte.getSource())
                .description(alerte.getDescription())
                .dateCreation(alerte.getDateCreation())
                .traitee(alerte.getTraitee())
                .build();
    }
}
