package tn.esprit.patient.service;

import tn.esprit.patient.dto.PatientCreationDTO;
import tn.esprit.patient.dto.PatientDTO;
import tn.esprit.patient.model.NiveauRisque;

import java.util.List;

public interface PatientService {
    PatientDTO create(PatientCreationDTO dto);
    PatientDTO getById(Long id);
    PatientDTO getByUserId(Long userId);
    List<PatientDTO> getAll();
    List<PatientDTO> getByMedecinId(Long medecinId);
    PatientDTO update(Long id, PatientDTO dto);
    PatientDTO updateNiveauRisque(Long id, NiveauRisque niveauRisque);
    void delete(Long id);
}
