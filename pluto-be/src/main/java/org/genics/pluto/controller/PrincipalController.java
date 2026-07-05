package org.genics.pluto.controller;

import lombok.RequiredArgsConstructor;
import org.genics.pluto.dto.principal.PrincipalAddRequest;
import org.genics.pluto.dto.principal.PrincipalUpdateRequest;
import org.genics.pluto.model.Principal;
import org.genics.pluto.service.PrincipalService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/principals")
@RequiredArgsConstructor
public class PrincipalController {

    private final PrincipalService principalService;

    @GetMapping
    public List<Principal> getAll() {
        return principalService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Principal> getById(@PathVariable Long id) {
        return principalService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-email")
    public ResponseEntity<Principal> getByEmail(@RequestParam String email) {
        return principalService.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Principal> create(@RequestBody PrincipalAddRequest req) {
        Principal saved = principalService.save(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public Principal update(@PathVariable Long id, @RequestBody PrincipalUpdateRequest req) {
        return principalService.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (principalService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        principalService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
