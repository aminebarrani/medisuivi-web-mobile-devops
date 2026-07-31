package tn.esprit.patient.service;

import tn.esprit.patient.dto.MaladieCreationDTO;
import tn.esprit.patient.dto.MaladieDTO;

import java.util.List;

public interface MaladieService {
    MaladieDTO create(MaladieCreationDTO dto);
    MaladieDTO getById(Long id);
    List<MaladieDTO> getAll();
    MaladieDTO update(Long id, MaladieDTO dto);
    void delete(Long id);
}
