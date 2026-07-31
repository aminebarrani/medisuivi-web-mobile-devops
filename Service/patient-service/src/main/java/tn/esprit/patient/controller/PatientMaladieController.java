package tn.esprit.patient.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.patient.dto.PatientMaladieCreationDTO;
import tn.esprit.patient.dto.PatientMaladieDTO;
import tn.esprit.patient.service.PatientMaladieService;

import java.util.List;

@RestController
@RequestMapping("/patient-maladies")
public class PatientMaladieController {

    private final PatientMaladieService patientMaladieService;

    public PatientMaladieController(PatientMaladieService patientMaladieService) {
        this.patientMaladieService = patientMaladieService;
    }

    @PostMapping
    public ResponseEntity<PatientMaladieDTO> addMaladieToPatient(@Valid @RequestBody PatientMaladieCreationDTO dto) {
        return new ResponseEntity<>(patientMaladieService.create(dto), HttpStatus.CREATED);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<PatientMaladieDTO>> getMaladiesByPatientId(@PathVariable Long patientId) {
        return ResponseEntity.ok(patientMaladieService.getByPatientId(patientId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeMaladieFromPatient(@PathVariable Long id) {
        patientMaladieService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
