package org.genics.pluto.controller;

import lombok.RequiredArgsConstructor;
import org.genics.pluto.dto.funding.FundingTransactionRequest;
import org.genics.pluto.model.FundingTransaction;
import org.genics.pluto.service.FundingTransactionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/funding/transactions")
@RequiredArgsConstructor
public class FundingTransactionController {

    private final FundingTransactionService txService;

    @PostMapping
    public ResponseEntity<FundingTransaction> create(@RequestBody FundingTransactionRequest req) {


        FundingTransaction saved = txService.create(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/by-account/{accountId}")
    public List<FundingTransaction> getByAccount(@PathVariable Long accountId) {
        return txService.findByAccountId(accountId);
    }

}
