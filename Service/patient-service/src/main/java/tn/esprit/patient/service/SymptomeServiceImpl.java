package tn.esprit.patient.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.patient.dto.SymptomeCreationDTO;
import tn.esprit.patient.dto.SymptomeDTO;
import tn.esprit.patient.exception.ResourceNotFoundException;
import tn.esprit.patient.model.Patient;
import tn.esprit.patient.model.Symptome;
import tn.esprit.patient.repository.PatientRepository;
import tn.esprit.patient.repository.SymptomeRepository;

import java.util.List;

@Service
@Transactional
public class SymptomeServiceImpl implements SymptomeService {

    private final SymptomeRepository symptomeRepository;
    private final PatientRepository patientRepository;

    public SymptomeServiceImpl(SymptomeRepository symptomeRepository, PatientRepository patientRepository) {
        this.symptomeRepository = symptomeRepository;
        this.patientRepository = patientRepository;
    }

    @Override
    public SymptomeDTO create(SymptomeCreationDTO dto) {
        if (!patientRepository.existsById(dto.getPatientId())) {
            throw new ResourceNotFoundException("Patient not found with id: " + dto.getPatientId());
        }

        Symptome symptome = Symptome.builder()
                .patientId(dto.getPatientId())
                .description(dto.getDescription())
                .gravite(dto.getGravite())
                .build();

        return mapToDTO(symptomeRepository.save(symptome));
    }

    @Override
    @Transactional(readOnly = true)
    public SymptomeDTO getById(Long id) {
        Symptome symptome = symptomeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Symptome not found with id: " + id));
        return mapToDTO(symptome);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SymptomeDTO> getByPatientId(Long patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }
        return symptomeRepository.findByPatientIdOrderByDateSignalementDesc(patientId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SymptomeDTO> getByMedecinId(Long medecinId) {
        List<Long> patientIds = patientRepository.findByMedecinId(medecinId).stream()
                .map(Patient::getId)
                .toList();
        if (patientIds.isEmpty()) {
            return List.of();
        }
        return symptomeRepository.findByPatientIdInOrderByDateSignalementDesc(patientIds).stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public void delete(Long id) {
        if (!symptomeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Symptome not found with id: " + id);
        }
        symptomeRepository.deleteById(id);
    }

    private SymptomeDTO mapToDTO(Symptome symptome) {
        return SymptomeDTO.builder()
                .id(symptome.getId())
                .patientId(symptome.getPatientId())
                .description(symptome.getDescription())
                .gravite(symptome.getGravite())
                .dateSignalement(symptome.getDateSignalement())
                .build();
    }
}
