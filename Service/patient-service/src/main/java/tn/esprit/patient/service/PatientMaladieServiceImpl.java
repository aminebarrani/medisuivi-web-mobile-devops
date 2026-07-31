package tn.esprit.patient.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.patient.dto.PatientMaladieCreationDTO;
import tn.esprit.patient.dto.PatientMaladieDTO;
import tn.esprit.patient.exception.ResourceNotFoundException;
import tn.esprit.patient.model.PatientMaladie;
import tn.esprit.patient.repository.MaladieRepository;
import tn.esprit.patient.repository.PatientMaladieRepository;
import tn.esprit.patient.repository.PatientRepository;

import java.util.List;

@Service
@Transactional
public class PatientMaladieServiceImpl implements PatientMaladieService {

    private final PatientMaladieRepository patientMaladieRepository;
    private final PatientRepository patientRepository;
    private final MaladieRepository maladieRepository;

    public PatientMaladieServiceImpl(PatientMaladieRepository patientMaladieRepository,
                                     PatientRepository patientRepository,
                                     MaladieRepository maladieRepository) {
        this.patientMaladieRepository = patientMaladieRepository;
        this.patientRepository = patientRepository;
        this.maladieRepository = maladieRepository;
    }

    @Override
    public PatientMaladieDTO create(PatientMaladieCreationDTO dto) {
        if (!patientRepository.existsById(dto.getPatientId())) {
            throw new ResourceNotFoundException("Patient not found with id: " + dto.getPatientId());
        }
        if (!maladieRepository.existsById(dto.getMaladieId())) {
            throw new ResourceNotFoundException("Maladie not found with id: " + dto.getMaladieId());
        }
        if (patientMaladieRepository.existsByPatientIdAndMaladieId(dto.getPatientId(), dto.getMaladieId())) {
            throw new IllegalArgumentException("This patient already has this maladie assigned");
        }

        PatientMaladie patientMaladie = PatientMaladie.builder()
                .patientId(dto.getPatientId())
                .maladieId(dto.getMaladieId())
                .dateDiagnostic(dto.getDateDiagnostic())
                .build();

        return mapToDTO(patientMaladieRepository.save(patientMaladie));
    }

    @Override
    @Transactional(readOnly = true)
    public PatientMaladieDTO getById(Long id) {
        return mapToDTO(findPatientMaladie(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientMaladieDTO> getAll() {
        return patientMaladieRepository.findAll().stream().map(this::mapToDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientMaladieDTO> getByPatientId(Long patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }
        return patientMaladieRepository.findByPatientId(patientId).stream().map(this::mapToDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientMaladieDTO> getByMaladieId(Long maladieId) {
        if (!maladieRepository.existsById(maladieId)) {
            throw new ResourceNotFoundException("Maladie not found with id: " + maladieId);
        }
        return patientMaladieRepository.findByMaladieId(maladieId).stream().map(this::mapToDTO).toList();
    }

    @Override
    public PatientMaladieDTO update(Long id, PatientMaladieDTO dto) {
        PatientMaladie patientMaladie = findPatientMaladie(id);
        patientMaladie.setDateDiagnostic(dto.getDateDiagnostic());
        return mapToDTO(patientMaladieRepository.save(patientMaladie));
    }

    @Override
    public void delete(Long id) {
        if (!patientMaladieRepository.existsById(id)) {
            throw new ResourceNotFoundException("PatientMaladie not found with id: " + id);
        }
        patientMaladieRepository.deleteById(id);
    }

    private PatientMaladie findPatientMaladie(Long id) {
        return patientMaladieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PatientMaladie not found with id: " + id));
    }

    private PatientMaladieDTO mapToDTO(PatientMaladie patientMaladie) {
        return PatientMaladieDTO.builder()
                .id(patientMaladie.getId())
                .patientId(patientMaladie.getPatientId())
                .maladieId(patientMaladie.getMaladieId())
                .dateDiagnostic(patientMaladie.getDateDiagnostic())
                .build();
    }
}
