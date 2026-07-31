package tn.esprit.patient.service;

import tn.esprit.patient.dto.SymptomeCreationDTO;
import tn.esprit.patient.dto.SymptomeDTO;

import java.util.List;

public interface SymptomeService {
    SymptomeDTO create(SymptomeCreationDTO dto);
    SymptomeDTO getById(Long id);
    List<SymptomeDTO> getByPatientId(Long patientId);
    List<SymptomeDTO> getByMedecinId(Long medecinId);
    void delete(Long id);
}
