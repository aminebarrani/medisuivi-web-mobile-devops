package tn.esprit.patient.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.patient.dto.MaladieCreationDTO;
import tn.esprit.patient.dto.MaladieDTO;
import tn.esprit.patient.service.MaladieService;

import java.util.List;

@RestController
@RequestMapping("/maladies")
public class MaladieController {

    private final MaladieService maladieService;

    public MaladieController(MaladieService maladieService) {
        this.maladieService = maladieService;
    }

    @PostMapping
    public ResponseEntity<MaladieDTO> create(@Valid @RequestBody MaladieCreationDTO dto) {
        return new ResponseEntity<>(maladieService.create(dto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<MaladieDTO>> getAll() {
        return ResponseEntity.ok(maladieService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaladieDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(maladieService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaladieDTO> update(@PathVariable Long id, @Valid @RequestBody MaladieDTO dto) {
        return ResponseEntity.ok(maladieService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        maladieService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
