package tn.esprit.patient.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.patient.dto.AlerteCreationDTO;
import tn.esprit.patient.dto.AlerteDTO;
import tn.esprit.patient.service.AlerteService;

import java.util.List;

@RestController
@RequestMapping("/alertes")
public class AlerteController {

    private final AlerteService alerteService;

    public AlerteController(AlerteService alerteService) {
        this.alerteService = alerteService;
    }

    @PostMapping
    public ResponseEntity<AlerteDTO> create(@Valid @RequestBody AlerteCreationDTO dto) {
        return new ResponseEntity<>(alerteService.create(dto), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlerteDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(alerteService.getById(id));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AlerteDTO>> getByPatientId(@PathVariable Long patientId) {
        return ResponseEntity.ok(alerteService.getByPatientId(patientId));
    }

    @GetMapping("/medecin/{medecinId}")
    public ResponseEntity<List<AlerteDTO>> getByMedecinId(@PathVariable Long medecinId) {
        return ResponseEntity.ok(alerteService.getByMedecinId(medecinId));
    }

    @GetMapping
    public ResponseEntity<List<AlerteDTO>> getByTraitee(@RequestParam(required = false) Boolean traitee) {
        if (traitee != null) {
            return ResponseEntity.ok(alerteService.getByTraitee(traitee));
        }
        return ResponseEntity.ok(alerteService.getByTraitee(false));
    }

    @PatchMapping("/{id}/traiter")
    public ResponseEntity<AlerteDTO> markAsTraitee(@PathVariable Long id) {
        return ResponseEntity.ok(alerteService.markAsTraitee(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        alerteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
