package tn.esprit.patient.service;

import tn.esprit.patient.dto.PatientMaladieCreationDTO;
import tn.esprit.patient.dto.PatientMaladieDTO;

import java.util.List;

public interface PatientMaladieService {
    PatientMaladieDTO create(PatientMaladieCreationDTO dto);
    PatientMaladieDTO getById(Long id);
    List<PatientMaladieDTO> getAll();
    List<PatientMaladieDTO> getByPatientId(Long patientId);
    List<PatientMaladieDTO> getByMaladieId(Long maladieId);
    PatientMaladieDTO update(Long id, PatientMaladieDTO dto);
    void delete(Long id);
}
