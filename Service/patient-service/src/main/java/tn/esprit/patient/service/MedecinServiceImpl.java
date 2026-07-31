package tn.esprit.patient.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.patient.dto.MedecinCreationDTO;
import tn.esprit.patient.dto.MedecinDTO;
import tn.esprit.patient.dto.PatientDTO;
import tn.esprit.patient.exception.ResourceNotFoundException;
import tn.esprit.patient.model.Medecin;
import tn.esprit.patient.model.NiveauRisque;
import tn.esprit.patient.model.Patient;
import tn.esprit.patient.repository.MedecinRepository;
import tn.esprit.patient.repository.PatientRepository;

import java.util.List;

@Service
@Transactional
public class MedecinServiceImpl implements MedecinService {

    private final MedecinRepository medecinRepository;
    private final PatientRepository patientRepository;

    public MedecinServiceImpl(MedecinRepository medecinRepository, PatientRepository patientRepository) {
        this.medecinRepository = medecinRepository;
        this.patientRepository = patientRepository;
    }

    @Override
    public MedecinDTO create(MedecinCreationDTO dto) {
        if (medecinRepository.existsByUserId(dto.getUserId())) {
            throw new IllegalArgumentException("A medecin profile already exists for userId: " + dto.getUserId());
        }
        if (medecinRepository.existsByNumeroOrdre(dto.getNumeroOrdre())) {
            throw new IllegalArgumentException("Numero ordre already registered: " + dto.getNumeroOrdre());
        }

        Medecin medecin = Medecin.builder()
                .userId(dto.getUserId())
                .specialite(dto.getSpecialite())
                .numeroOrdre(dto.getNumeroOrdre())
                .build();

        return mapToDTO(medecinRepository.save(medecin));
    }

    @Override
    @Transactional(readOnly = true)
    public MedecinDTO getById(Long id) {
        return mapToDTO(findMedecin(id));
    }

    @Override
    @Transactional(readOnly = true)
    public MedecinDTO getByUserId(Long userId) {
        Medecin medecin = medecinRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Medecin not found for userId: " + userId));
        return mapToDTO(medecin);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedecinDTO> getAll() {
        return medecinRepository.findAll().stream().map(this::mapToDTO).toList();
    }

    @Override
    public MedecinDTO update(Long id, MedecinDTO dto) {
        Medecin medecin = findMedecin(id);

        if (!medecin.getNumeroOrdre().equals(dto.getNumeroOrdre())
                && medecinRepository.existsByNumeroOrdre(dto.getNumeroOrdre())) {
            throw new IllegalArgumentException("Numero ordre already registered: " + dto.getNumeroOrdre());
        }

        medecin.setSpecialite(dto.getSpecialite());
        medecin.setNumeroOrdre(dto.getNumeroOrdre());
        return mapToDTO(medecinRepository.save(medecin));
    }

    @Override
    public void delete(Long id) {
        if (!medecinRepository.existsById(id)) {
            throw new ResourceNotFoundException("Medecin not found with id: " + id);
        }
        medecinRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientDTO> getPatients(Long medecinId, Long maladieId, NiveauRisque niveauRisque) {
        if (!medecinRepository.existsById(medecinId)) {
            throw new ResourceNotFoundException("Medecin not found with id: " + medecinId);
        }

        List<Patient> patients;
        if (maladieId != null && niveauRisque != null) {
            patients = patientRepository.findByMedecinIdAndMaladieIdAndNiveauRisque(medecinId, maladieId, niveauRisque);
        } else if (maladieId != null) {
            patients = patientRepository.findByMedecinIdAndMaladieId(medecinId, maladieId);
        } else if (niveauRisque != null) {
            patients = patientRepository.findByMedecinIdAndNiveauRisque(medecinId, niveauRisque);
        } else {
            patients = patientRepository.findByMedecinId(medecinId);
        }

        return patients.stream().map(this::mapPatientToDTO).toList();
    }

    private Medecin findMedecin(Long id) {
        return medecinRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medecin not found with id: " + id));
    }

    private MedecinDTO mapToDTO(Medecin medecin) {
        return MedecinDTO.builder()
                .id(medecin.getId())
                .userId(medecin.getUserId())
                .specialite(medecin.getSpecialite())
                .numeroOrdre(medecin.getNumeroOrdre())
                .build();
    }

    private PatientDTO mapPatientToDTO(Patient patient) {
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
