package tn.esprit.patient.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.patient.dto.PatientCreationDTO;
import tn.esprit.patient.dto.PatientDTO;
import tn.esprit.patient.exception.ResourceNotFoundException;
import tn.esprit.patient.model.NiveauRisque;
import tn.esprit.patient.model.Patient;
import tn.esprit.patient.repository.MedecinRepository;
import tn.esprit.patient.repository.PatientRepository;

import java.util.List;

@Service
@Transactional
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final MedecinRepository medecinRepository;

    public PatientServiceImpl(PatientRepository patientRepository, MedecinRepository medecinRepository) {
        this.patientRepository = patientRepository;
        this.medecinRepository = medecinRepository;
    }

    @Override
    public PatientDTO create(PatientCreationDTO dto) {
        if (patientRepository.existsByUserId(dto.getUserId())) {
            throw new IllegalArgumentException("A patient profile already exists for userId: " + dto.getUserId());
        }
        if (!medecinRepository.existsById(dto.getMedecinId())) {
            throw new ResourceNotFoundException("Medecin not found with id: " + dto.getMedecinId());
        }

        Patient patient = Patient.builder()
                .userId(dto.getUserId())
                .medecinId(dto.getMedecinId())
                .dateNaissance(dto.getDateNaissance())
                .sexe(dto.getSexe())
                .niveauRisque(dto.getNiveauRisque() != null ? dto.getNiveauRisque() : NiveauRisque.FAIBLE)
                .build();

        return mapToDTO(patientRepository.save(patient));
    }

    @Override
    @Transactional(readOnly = true)
    public PatientDTO getById(Long id) {
        return mapToDTO(findPatient(id));
    }

    @Override
    @Transactional(readOnly = true)
    public PatientDTO getByUserId(Long userId) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found for userId: " + userId));
        return mapToDTO(patient);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientDTO> getAll() {
        return patientRepository.findAll().stream().map(this::mapToDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientDTO> getByMedecinId(Long medecinId) {
        if (!medecinRepository.existsById(medecinId)) {
            throw new ResourceNotFoundException("Medecin not found with id: " + medecinId);
        }
        return patientRepository.findByMedecinId(medecinId).stream().map(this::mapToDTO).toList();
    }

    @Override
    public PatientDTO update(Long id, PatientDTO dto) {
        Patient patient = findPatient(id);

        if (!medecinRepository.existsById(dto.getMedecinId())) {
            throw new ResourceNotFoundException("Medecin not found with id: " + dto.getMedecinId());
        }

        patient.setMedecinId(dto.getMedecinId());
        patient.setDateNaissance(dto.getDateNaissance());
        patient.setSexe(dto.getSexe());
        patient.setNiveauRisque(dto.getNiveauRisque());
        return mapToDTO(patientRepository.save(patient));
    }

    @Override
    public PatientDTO updateNiveauRisque(Long id, NiveauRisque niveauRisque) {
        Patient patient = findPatient(id);
        patient.setNiveauRisque(niveauRisque);
        return mapToDTO(patientRepository.save(patient));
    }

    @Override
    public void delete(Long id) {
        if (!patientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Patient not found with id: " + id);
        }
        patientRepository.deleteById(id);
    }

    private Patient findPatient(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
    }

    private PatientDTO mapToDTO(Patient patient) {
        return PatientDTO.builder()
                .id(patient.getId())
                .userId(patient.getUserId())
                .medecinId(patient.getMedecinId())
                .dateNaissance(patient.getDateNaissance())
                .sexe(patient.getSexe())
                .niveauRisque(patient.getNiveauRisque())
                .dateCreation(patient.getDateCreation())
                .build();
    }
}
