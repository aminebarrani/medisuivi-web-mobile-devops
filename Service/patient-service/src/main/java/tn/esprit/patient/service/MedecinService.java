package tn.esprit.patient.service;

import tn.esprit.patient.dto.MedecinCreationDTO;
import tn.esprit.patient.dto.MedecinDTO;
import tn.esprit.patient.dto.PatientDTO;
import tn.esprit.patient.model.NiveauRisque;

import java.util.List;

public interface MedecinService {
    MedecinDTO create(MedecinCreationDTO dto);
    MedecinDTO getById(Long id);
    MedecinDTO getByUserId(Long userId);
    List<MedecinDTO> getAll();
    MedecinDTO update(Long id, MedecinDTO dto);
    void delete(Long id);
    List<PatientDTO> getPatients(Long medecinId, Long maladieId, NiveauRisque niveauRisque);
}
