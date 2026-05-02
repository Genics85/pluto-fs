package org.genics.pluto.controller;

import lombok.RequiredArgsConstructor;
import org.genics.pluto.dto.repayment.UpdateRepaymentRequest;
import org.genics.pluto.model.Repayment;
import org.genics.pluto.service.RepaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/repayments")
@RequiredArgsConstructor
public class RepaymentController {

    private final RepaymentService repaymentService;

    @GetMapping
    public List<Repayment> getAll() {
        return repaymentService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Repayment> getById(@PathVariable Long id) {
        return repaymentService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-loan/{loanId}")
    public List<Repayment> getByLoanId(@PathVariable Long loanId) {
        return repaymentService.findByLoanIdOrderByPaymentDateDesc(loanId);
    }

    @GetMapping("/between")
    public List<Repayment> getBetween(@RequestParam String start, @RequestParam String end) {
        LocalDate s = LocalDate.parse(start);
        LocalDate e = LocalDate.parse(end);
        return repaymentService.findByPaymentDateBetween(s, e);
    }

    @PostMapping
    public ResponseEntity<Repayment> create(@RequestBody Repayment repayment) {
        Repayment saved = repaymentService.save(repayment);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (repaymentService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        repaymentService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/status")
    public ResponseEntity<Repayment> updateStatus(@PathVariable Long id, @RequestBody UpdateRepaymentRequest req) {
        return repaymentService.updateStatus(id, req)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

}
