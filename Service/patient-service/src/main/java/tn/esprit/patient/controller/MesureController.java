package tn.esprit.patient.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.patient.dto.MesureCreationDTO;
import tn.esprit.patient.dto.MesureDTO;
import tn.esprit.patient.service.MesureService;

import java.util.List;

@RestController
@RequestMapping("/mesures")
public class MesureController {

    private final MesureService mesureService;

    public MesureController(MesureService mesureService) {
        this.mesureService = mesureService;
    }

    @PostMapping
    public ResponseEntity<MesureDTO> create(@Valid @RequestBody MesureCreationDTO dto) {
        return new ResponseEntity<>(mesureService.create(dto), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MesureDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(mesureService.getById(id));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MesureDTO>> getByPatientId(@PathVariable Long patientId) {
        return ResponseEntity.ok(mesureService.getByPatientId(patientId));
    }

    @GetMapping("/medecin/{medecinId}")
    public ResponseEntity<List<MesureDTO>> getByMedecinId(@PathVariable Long medecinId) {
        return ResponseEntity.ok(mesureService.getByMedecinId(medecinId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        mesureService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
