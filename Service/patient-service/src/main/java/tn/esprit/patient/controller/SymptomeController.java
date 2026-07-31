package tn.esprit.patient.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.patient.dto.SymptomeCreationDTO;
import tn.esprit.patient.dto.SymptomeDTO;
import tn.esprit.patient.service.SymptomeService;

import java.util.List;

@RestController
@RequestMapping("/symptomes")
public class SymptomeController {

    private final SymptomeService symptomeService;

    public SymptomeController(SymptomeService symptomeService) {
        this.symptomeService = symptomeService;
    }

    @PostMapping
    public ResponseEntity<SymptomeDTO> create(@Valid @RequestBody SymptomeCreationDTO dto) {
        return new ResponseEntity<>(symptomeService.create(dto), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SymptomeDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(symptomeService.getById(id));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<SymptomeDTO>> getByPatientId(@PathVariable Long patientId) {
        return ResponseEntity.ok(symptomeService.getByPatientId(patientId));
    }

    @GetMapping("/medecin/{medecinId}")
    public ResponseEntity<List<SymptomeDTO>> getByMedecinId(@PathVariable Long medecinId) {
        return ResponseEntity.ok(symptomeService.getByMedecinId(medecinId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        symptomeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
