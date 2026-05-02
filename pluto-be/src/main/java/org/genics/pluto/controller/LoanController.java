package org.genics.pluto.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.genics.pluto.dto.loan.LoanAddRequest;
import org.genics.pluto.dto.loan.LoanStatusUpdateRequest;
import org.genics.pluto.enums.LoanStatus;
import org.genics.pluto.model.Loan;
import org.genics.pluto.service.LoanService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;

    @GetMapping
    public List<Loan> getAll() {
        return loanService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Loan> getById(@PathVariable Long id) {
        return loanService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-user/{userId}")
    public List<Loan> getByUserId(@PathVariable Long userId) {
        return loanService.findByUserId(userId);
    }

    @GetMapping("/by-status")
    public List<Loan> getByStatus(@RequestParam LoanStatus status) {
        return loanService.findByStatus(status);
    }

    @PostMapping
    public ResponseEntity<Loan> create(@Valid @RequestBody LoanAddRequest loan) {
        Loan saved = loanService.save(loan);

        log.info("Created loan with id: {}", saved.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/{id}/status")
    public ResponseEntity<Loan> updateStatus(@PathVariable Long id,
                                             @Valid @RequestBody LoanStatusUpdateRequest request) {
        return loanService.updateStatus(id, request.getStatus())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (loanService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        loanService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
