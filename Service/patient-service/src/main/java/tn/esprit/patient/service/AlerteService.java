package tn.esprit.patient.service;

import tn.esprit.patient.dto.AlerteCreationDTO;
import tn.esprit.patient.dto.AlerteDTO;

import java.util.List;

public interface AlerteService {
    AlerteDTO create(AlerteCreationDTO dto);
    AlerteDTO getById(Long id);
    List<AlerteDTO> getByPatientId(Long patientId);
    List<AlerteDTO> getByMedecinId(Long medecinId);
    List<AlerteDTO> getByTraitee(Boolean traitee);
    AlerteDTO markAsTraitee(Long id);
    void delete(Long id);
}
