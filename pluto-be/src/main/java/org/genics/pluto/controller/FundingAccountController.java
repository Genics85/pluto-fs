package org.genics.pluto.controller;

import lombok.RequiredArgsConstructor;
import org.genics.pluto.dto.funding.FundingAccountRequest;
import org.genics.pluto.model.FundingAccount;
import org.genics.pluto.service.FundingAccountService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/funding/accounts")
@RequiredArgsConstructor
public class FundingAccountController {

    private final FundingAccountService accountService;

    @PostMapping
    public ResponseEntity<FundingAccount> create(@RequestBody FundingAccountRequest req) {
        FundingAccount acc = accountService.createAccount(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(acc);
    }

    @GetMapping
    public List<FundingAccount> getAll() {
        return accountService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<FundingAccount> getById(@PathVariable Long id) {
        return accountService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

//    @PostMapping("/{id}/deposit")
//    public ResponseEntity<FundingAccount> deposit(@PathVariable Long id, @RequestParam BigDecimal amount) {
//        FundingAccount acc = accountService.deposit(id, amount);
//        return ResponseEntity.ok(acc);
//    }
//
//    @PostMapping("/{id}/withdraw")
//    public ResponseEntity<FundingAccount> withdraw(@PathVariable Long id, @RequestParam BigDecimal amount) {
//        FundingAccount acc = accountService.withdraw(id, amount);
//        return ResponseEntity.ok(acc);
//    }
//
//    @PostMapping("/{id}/allocate")
//    public ResponseEntity<FundingAccount> allocate(@PathVariable Long id, @RequestParam BigDecimal amount, @RequestParam Long loanId) {
//        FundingAccount acc = accountService.allocateForLoan(id, amount, loanId);
//        return ResponseEntity.ok(acc);
//    }
//
//    @PostMapping("/{id}/release")
//    public ResponseEntity<FundingAccount> release(@PathVariable Long id, @RequestParam BigDecimal amount, @RequestParam Long loanId) {
//        FundingAccount acc = accountService.releaseFromLoan(id, amount, loanId);
//        return ResponseEntity.ok(acc);
//    }

}

