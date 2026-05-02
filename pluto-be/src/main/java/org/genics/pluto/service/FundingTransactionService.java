package org.genics.pluto.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.genics.pluto.dto.funding.FundingTransactionRequest;
import org.genics.pluto.enums.FundingTransactionType;
import org.genics.pluto.model.FundingAccount;
import org.genics.pluto.model.FundingTransaction;
import org.genics.pluto.repository.FundingAccountRepository;
import org.genics.pluto.repository.FundingTransactionRepository;
import org.genics.pluto.repository.PrincipalRepository;
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

    public FundingTransaction create(FundingTransactionRequest req) {

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

        FundingTransaction tx = txBuilder.build();

        var transaction = txRepo.save(tx);
        var txType = req.getType();
        var amount = req.getAmount();
        var accountId = req.getAccountId();

        switch (txType) {
            case DEPOSIT ->
                    accountService.deposit( accountId, amount );
            case WITHDRAWAL ->
                    accountService.withdraw( accountId,amount );
        }

        return transaction;
    }

    public List<FundingTransaction> findByAccountId(Long accountId) {
        return txRepo.findByFundingAccountIdOrderByCreatedAtDesc(accountId);
    }

}

