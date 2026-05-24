package org.genics.pluto.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.genics.pluto.dto.funding.FundingTransactionRequest;
import org.genics.pluto.dto.funding.FundingTransactionResponse;
import org.genics.pluto.model.FundingAccount;
import org.genics.pluto.model.FundingTransaction;
import org.genics.pluto.repository.FundingAccountRepository;
import org.genics.pluto.repository.FundingTransactionRepository;
import org.genics.pluto.repository.PrincipalRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class FundingTransactionService {

    private final FundingTransactionRepository txRepo;
    private final FundingAccountService accountService;
    private final FundingAccountRepository accountRepo;
    private final PrincipalRepository principalRepo;

    public FundingTransactionResponse create(FundingTransactionRequest req) {

        FundingAccount acc = accountRepo.findById(req.getAccountId())
                .orElseThrow(() -> new IllegalArgumentException("Funding account not found"));

        FundingTransaction.FundingTransactionBuilder txBuilder = FundingTransaction.builder()
                .fundingAccount(acc)
                .amount(req.getAmount())
                .type(req.getType())
                .note(req.getNote());

        if (req.getPrincipalId() != null) {
            principalRepo.findById(req.getPrincipalId()).ifPresent(txBuilder::principal);
        }

        FundingTransaction tx = txRepo.save(txBuilder.build());

        switch (req.getType()) {
            case DEPOSIT -> accountService.deposit(req.getAccountId(), req.getAmount());
            case WITHDRAWAL -> accountService.withdraw(req.getAccountId(), req.getAmount());
            default -> { /* ALLOCATION, RELEASE, ADJUSTMENT — no balance mutation */ }
        }

        return toResponse(tx);
    }

    public List<FundingTransactionResponse> findByAccountId(Long accountId) {
        return txRepo.findByFundingAccountIdOrderByCreatedAtDesc(accountId, PageRequest.of(0, 50))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private FundingTransactionResponse toResponse(FundingTransaction tx) {
        return FundingTransactionResponse.builder()
                .id(tx.getId())
                .accountId(tx.getFundingAccount().getId())
                .amount(tx.getAmount())
                .type(tx.getType())
                .note(tx.getNote())
                .principalId(tx.getPrincipal() != null ? tx.getPrincipal().getId() : null)
                .createdAt(tx.getCreatedAt())
                .build();
    }

}

