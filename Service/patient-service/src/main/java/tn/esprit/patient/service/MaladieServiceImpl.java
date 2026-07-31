package tn.esprit.patient.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.patient.dto.MaladieCreationDTO;
import tn.esprit.patient.dto.MaladieDTO;
import tn.esprit.patient.exception.ResourceNotFoundException;
import tn.esprit.patient.model.Maladie;
import tn.esprit.patient.repository.MaladieRepository;

import java.util.List;

@Service
@Transactional
public class MaladieServiceImpl implements MaladieService {

    private final MaladieRepository maladieRepository;

    public MaladieServiceImpl(MaladieRepository maladieRepository) {
        this.maladieRepository = maladieRepository;
    }

    @Override
    public MaladieDTO create(MaladieCreationDTO dto) {
        if (maladieRepository.existsByNom(dto.getNom())) {
            throw new IllegalArgumentException("Maladie already exists: " + dto.getNom());
        }

        Maladie maladie = Maladie.builder()
                .nom(dto.getNom())
                .description(dto.getDescription())
                .parametresSuivis(dto.getParametresSuivis())
                .seuilMin(dto.getSeuilMin())
                .seuilMax(dto.getSeuilMax())
                .build();

        return mapToDTO(maladieRepository.save(maladie));
    }

    @Override
    @Transactional(readOnly = true)
    public MaladieDTO getById(Long id) {
        return mapToDTO(findMaladie(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaladieDTO> getAll() {
        return maladieRepository.findAll().stream().map(this::mapToDTO).toList();
    }

    @Override
    public MaladieDTO update(Long id, MaladieDTO dto) {
        Maladie maladie = findMaladie(id);

        if (!maladie.getNom().equals(dto.getNom()) && maladieRepository.existsByNom(dto.getNom())) {
            throw new IllegalArgumentException("Maladie already exists: " + dto.getNom());
        }

        maladie.setNom(dto.getNom());
        maladie.setDescription(dto.getDescription());
        maladie.setParametresSuivis(dto.getParametresSuivis());
        maladie.setSeuilMin(dto.getSeuilMin());
        maladie.setSeuilMax(dto.getSeuilMax());
        return mapToDTO(maladieRepository.save(maladie));
    }

    @Override
    public void delete(Long id) {
        if (!maladieRepository.existsById(id)) {
            throw new ResourceNotFoundException("Maladie not found with id: " + id);
        }
        maladieRepository.deleteById(id);
    }

    private Maladie findMaladie(Long id) {
        return maladieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maladie not found with id: " + id));
    }

    private MaladieDTO mapToDTO(Maladie maladie) {
        return MaladieDTO.builder()
                .id(maladie.getId())
                .nom(maladie.getNom())
                .description(maladie.getDescription())
                .parametresSuivis(maladie.getParametresSuivis())
                .seuilMin(maladie.getSeuilMin())
                .seuilMax(maladie.getSeuilMax())
                .build();
    }
}
