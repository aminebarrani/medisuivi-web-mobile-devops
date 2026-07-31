package tn.esprit.patient.service;

import tn.esprit.patient.dto.MesureCreationDTO;
import tn.esprit.patient.dto.MesureDTO;

import java.util.List;

public interface MesureService {
    MesureDTO create(MesureCreationDTO dto);
    MesureDTO getById(Long id);
    List<MesureDTO> getByPatientId(Long patientId);
    List<MesureDTO> getByMedecinId(Long medecinId);
    void delete(Long id);
}
