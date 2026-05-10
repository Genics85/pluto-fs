package org.genics.pluto.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.genics.pluto.dto.funding.FundingAccountRequest;
import org.genics.pluto.model.FundingAccount;
import org.genics.pluto.model.FundingTransaction;
import org.genics.pluto.enums.FundingTransactionType;
import org.genics.pluto.repository.FundingAccountRepository;
import org.genics.pluto.repository.FundingTransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class FundingAccountService {

    private final FundingAccountRepository accountRepo;
    private final FundingTransactionRepository txRepo;

    public FundingAccount createAccount(FundingAccountRequest req) {
        BigDecimal init = req.getInitialDeposit() == null ? BigDecimal.ZERO : req.getInitialDeposit();
        FundingAccount acc = FundingAccount.builder()
                .name(req.getName())
                .currency(req.getCurrency())
                .totalBalance(init)
                .availableBalance(init)
                .reservedBalance(BigDecimal.ZERO)
                .build();

        acc = accountRepo.save(acc);

        if (init.compareTo(BigDecimal.ZERO) > 0) {
            txRepo.save(FundingTransaction.builder()
                    .fundingAccount(acc)
                    .amount(init)
                    .type(FundingTransactionType.DEPOSIT)
                    .note("Initial deposit")
                    .build());
        }

        return acc;
    }

    public List<FundingAccount> findAll() {
        return accountRepo.findAll();
    }

    public java.util.Optional<FundingAccount> findById(Long id) {
        return accountRepo.findById(id);
    }

    public FundingAccount deposit(Long accountId, BigDecimal amount) {
        FundingAccount acc = accountRepo.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Funding account not found"));

        acc.setTotalBalance(acc.getTotalBalance().add(amount));
        acc.setAvailableBalance(acc.getAvailableBalance().add(amount));
        accountRepo.save(acc);

        // txRepo.save(FundingTransaction.builder()
        //         .fundingAccount(acc)
        //         .amount(amount)
        //         .type(FundingTransactionType.DEPOSIT)
        //         .note("Deposit")
        //         .build());

        return acc;
    }

    public FundingAccount withdraw(Long accountId, BigDecimal amount) {
        FundingAccount acc = accountRepo.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Funding account not found"));

        if (acc.getAvailableBalance().compareTo(amount) < 0) {
            throw new IllegalStateException("Insufficient available balance");
        }

        acc.setTotalBalance(acc.getTotalBalance().subtract(amount));
        acc.setAvailableBalance(acc.getAvailableBalance().subtract(amount));
        accountRepo.save(acc);

        // txRepo.save(FundingTransaction.builder()
        //         .fundingAccount(acc)
        //         .amount(amount.negate())
        //         .type(FundingTransactionType.WITHDRAWAL)
        //         .note("Withdrawal")
        //         .build());

        return acc;
    }

    public FundingAccount allocateForLoan(Long accountId, BigDecimal amount, Long loanId) {
        FundingAccount acc = accountRepo.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Funding account not found"));

        if (acc.getAvailableBalance().compareTo(amount) < 0) {
            throw new IllegalStateException("Insufficient available balance");
        }

        acc.setAvailableBalance(acc.getAvailableBalance().subtract(amount));
        acc.setReservedBalance(acc.getReservedBalance().add(amount));
        accountRepo.save(acc);

        txRepo.save(FundingTransaction.builder()
                .fundingAccount(acc)
                .amount(amount)
                .type(FundingTransactionType.ALLOCATION)
                .note("Allocated to loan " + loanId)
                .build());

        return acc;
    }

    public FundingAccount releaseFromLoan(Long accountId, BigDecimal totalAmount, Long loanId, String customerName) {
        FundingAccount acc = accountRepo.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Funding account not found"));

        BigDecimal reservedToRelease = totalAmount.min(acc.getReservedBalance());

        BigDecimal spilloverAmount = totalAmount.subtract(reservedToRelease);

        if (acc.getReservedBalance().compareTo(totalAmount) <= 0) {
            acc.setTotalBalance(acc.getTotalBalance().add(spilloverAmount));
        }

        acc.setReservedBalance(acc.getReservedBalance().subtract(reservedToRelease));
        acc.setAvailableBalance(acc.getAvailableBalance().add(totalAmount));


        accountRepo.save(acc);

        txRepo.save(FundingTransaction.builder()
                .fundingAccount(acc)
                .amount(totalAmount)
                .type(FundingTransactionType.RELEASE)
                .note("Loan repayment by " + customerName + " from loan " + loanId)
                .build());

        return acc;
    }

//    public FundingAccount releaseFromLoan(Long accountId, BigDecimal amount, Long loanId) {
//        FundingAccount acc = accountRepo.findById(accountId)
//                .orElseThrow(() -> new IllegalArgumentException("Funding account not found"));
//
//        if (acc.getReservedBalance().compareTo(amount) < 0) {
//            throw new IllegalStateException("Reserved balance insufficient");
//        }
//
//        acc.setReservedBalance(acc.getReservedBalance().subtract(amount));
//        acc.setAvailableBalance(acc.getAvailableBalance().add(amount));
//        accountRepo.save(acc);
//
//        txRepo.save(FundingTransaction.builder()
//                .fundingAccount(acc)
//                .amount(amount)
//                .type(FundingTransactionType.RELEASE)
//                .note("Released from loan " + loanId)
//                .build());
//
//        return acc;
//    }

}
