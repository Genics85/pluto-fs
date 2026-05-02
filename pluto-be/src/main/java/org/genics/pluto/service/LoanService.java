package org.genics.pluto.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.genics.pluto.dto.loan.LoanAddRequest;
import org.genics.pluto.enums.LoanStatus;
import org.genics.pluto.model.Borrower;
import org.genics.pluto.model.Loan;
import org.genics.pluto.model.Repayment;
import org.genics.pluto.repository.BorrowerRepository;
import org.genics.pluto.repository.LoanRepository;
import org.genics.pluto.repository.RepaymentRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class LoanService {

    private final LoanRepository loanRepository;
    private final BorrowerRepository borrowerRepository;
    private final RepaymentRepository repaymentRepository;
    private final FundingAccountService fundingAccountService;


    public List<Loan> findAll() {
        return loanRepository.findAll();
    }

    public Optional<Loan> findById(Long id) {
        return loanRepository.findById(id);
    }

    public List<Loan> findByUserId(Long userId) {
        return loanRepository.findByBorrowerId(userId);
    }

    public List<Loan> findByStatus(LoanStatus status) {
        return loanRepository.findByStatus(status);
    }

    public Loan save(LoanAddRequest req) {

        log.info("Creating loan for borrower id: {}", req.getBorrowerId());

        Borrower borrower = borrowerRepository.findById(req.getBorrowerId())
                .orElseThrow(() -> new IllegalArgumentException("Borrower not found for id: " + req.getBorrowerId()));

        var payable = req.getPrincipalAmount()
                .add(req.getPrincipalAmount().multiply(req.getInterestRate())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));

        var loan = Loan.builder()
                .borrower(borrower)
                .principalAmount(req.getPrincipalAmount())
                .interestRate(req.getInterestRate())
                .durationWeeks(req.getDurationWeeks())
                .startDate(req.getStartDate())
                .endDate(req.getStartDate().plusWeeks(req.getDurationWeeks()))
                .totalPayable(payable)
                .outstandingBalance(payable)
                .status(LoanStatus.ACTIVE)
                .build();

        Loan saved = loanRepository.save(loan);

        fundingAccountService.allocateForLoan(1L,saved.getPrincipalAmount(), saved.getId());

        // create repayment schedule: durationWeeks repayments, equally divided
        if (saved.getDurationWeeks() > 0 && saved.getTotalPayable() != null && saved.getStartDate() != null) {
            BigDecimal total = saved.getTotalPayable();
            int weeks = saved.getDurationWeeks();
            BigDecimal perRepayment = total.divide(BigDecimal.valueOf(weeks), 2, RoundingMode.HALF_UP);

            List<Repayment> repayments = new ArrayList<>();
            for (int i = 0; i < weeks; i++) {
                Repayment r = Repayment.builder()
                        .loan(saved)
                        .amountPaid(perRepayment)
                        .paymentDate(saved.getStartDate().plusWeeks(i))
                        .build();
                repayments.add(r);
            }

            repaymentRepository.saveAll(repayments);
            log.info("Created {} repayment entries for loan id {}", repayments.size(), saved.getId());
        } else {
            log.warn("Loan saved but repayments not created due to missing startDate/totalPayable/durationWeeks: loanId={}", saved.getId());
        }

        return saved;
    }

    public Optional<Loan> updateStatus(Long id, LoanStatus status) {
        return loanRepository.findById(id)
                .map(loan -> {
                    loan.setStatus(status);
                    log.info("Updated loan {} status to {}", id, status);
                    return loanRepository.save(loan);
                });
    }

    public void deleteById(Long id) {
        loanRepository.deleteById(id);
    }

}
