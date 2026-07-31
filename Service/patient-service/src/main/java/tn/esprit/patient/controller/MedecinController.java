package tn.esprit.patient.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.patient.dto.MedecinCreationDTO;
import tn.esprit.patient.dto.MedecinDTO;
import tn.esprit.patient.dto.PatientDTO;
import tn.esprit.patient.model.NiveauRisque;
import tn.esprit.patient.service.MedecinService;

import java.util.List;

@RestController
@RequestMapping("/medecins")
public class MedecinController {

    private final MedecinService medecinService;

    public MedecinController(MedecinService medecinService) {
        this.medecinService = medecinService;
    }

    @PostMapping
    public ResponseEntity<MedecinDTO> create(@Valid @RequestBody MedecinCreationDTO dto) {
        return new ResponseEntity<>(medecinService.create(dto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<MedecinDTO>> getAll() {
        return ResponseEntity.ok(medecinService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedecinDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(medecinService.getById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<MedecinDTO> getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(medecinService.getByUserId(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedecinDTO> update(@PathVariable Long id, @Valid @RequestBody MedecinDTO dto) {
        return ResponseEntity.ok(medecinService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        medecinService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/patients")
    public ResponseEntity<List<PatientDTO>> getPatients(
            @PathVariable Long id,
            @RequestParam(required = false) Long maladieId,
            @RequestParam(required = false) NiveauRisque niveauRisque) {
        return ResponseEntity.ok(medecinService.getPatients(id, maladieId, niveauRisque));
    }
}
