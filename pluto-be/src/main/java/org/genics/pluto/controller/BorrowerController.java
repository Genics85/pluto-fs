package org.genics.pluto.controller;

import lombok.RequiredArgsConstructor;
import org.genics.pluto.dto.borrower.BorrowerAddRequest;
import org.genics.pluto.dto.borrower.BorrowerUpdateRequest;
import org.genics.pluto.model.Borrower;
import org.genics.pluto.service.BorrowerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/borrowers")
@RequiredArgsConstructor
public class BorrowerController {

    private final BorrowerService borrowerService;

    @GetMapping
    public List<Borrower> getAll() {
        return borrowerService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Borrower> getById(@PathVariable Long id) {
        return borrowerService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-email")
    public ResponseEntity<Borrower> getByEmail(@RequestParam String email) {
        return borrowerService.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Borrower> create(@RequestBody BorrowerAddRequest borrower) {
        Borrower saved = borrowerService.save(borrower);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Borrower> update(@PathVariable Long id, @RequestBody BorrowerUpdateRequest borrower) {
        return borrowerService.update(id, borrower)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

}

