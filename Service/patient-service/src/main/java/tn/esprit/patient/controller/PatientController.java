package tn.esprit.patient.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.patient.dto.PatientCreationDTO;
import tn.esprit.patient.dto.PatientDTO;
import tn.esprit.patient.model.NiveauRisque;
import tn.esprit.patient.service.PatientService;

import java.util.List;

@RestController
@RequestMapping("/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @PostMapping
    public ResponseEntity<PatientDTO> create(@Valid @RequestBody PatientCreationDTO dto) {
        return new ResponseEntity<>(patientService.create(dto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<PatientDTO>> getAll() {
        return ResponseEntity.ok(patientService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<PatientDTO> getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(patientService.getByUserId(userId));
    }

    @GetMapping("/medecin/{medecinId}")
    public ResponseEntity<List<PatientDTO>> getByMedecinId(@PathVariable Long medecinId) {
        return ResponseEntity.ok(patientService.getByMedecinId(medecinId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatientDTO> update(@PathVariable Long id, @Valid @RequestBody PatientDTO dto) {
        return ResponseEntity.ok(patientService.update(id, dto));
    }

    @PatchMapping("/{id}/niveau-risque")
    public ResponseEntity<PatientDTO> updateNiveauRisque(
            @PathVariable Long id,
            @RequestParam NiveauRisque niveauRisque) {
        return ResponseEntity.ok(patientService.updateNiveauRisque(id, niveauRisque));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        patientService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
