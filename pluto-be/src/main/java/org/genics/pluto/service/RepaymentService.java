package org.genics.pluto.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.genics.pluto.dto.repayment.UpdateRepaymentRequest;
import org.genics.pluto.enums.RepaymentStatus;
import org.genics.pluto.model.Loan;
import org.genics.pluto.model.Repayment;
import org.genics.pluto.repository.RepaymentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class RepaymentService {

    private final RepaymentRepository repaymentRepository;
    private final FundingAccountService fundingAccountService;

    public List<Repayment> findAll() {
        return repaymentRepository.findAll();
    }

    public Optional<Repayment> findById(Long id) {
        return repaymentRepository.findById(id);
    }

    public List<Repayment> findByLoanId(Long loanId) {
        return repaymentRepository.findByLoanId(loanId);
    }

    public List<Repayment> findByLoanIdOrderByPaymentDateDesc(Long loanId) {
        return repaymentRepository.findByLoanIdOrderByPaymentDateDesc(loanId);
    }

    public List<Repayment> findByPaymentDateBetween(LocalDate start, LocalDate end) {
        return repaymentRepository.findByPaymentDateBetween(start, end);
    }

    public Repayment save(Repayment repayment) {
        return repaymentRepository.save(repayment);
    }

    public void deleteById(Long id) {
        repaymentRepository.deleteById(id);
    }

    public java.util.Optional<Repayment> updateStatus(Long id, UpdateRepaymentRequest req) {
        return repaymentRepository.findById(id).map(r -> {


            if(r.getRepaymentStatus().equals(RepaymentStatus.PAID)) return r;

            var newStatus = req.getRepaymentStatus();
            if (newStatus != null) {
                r.setRepaymentStatus(newStatus);
                if(newStatus.equals(RepaymentStatus.PAID)){
                    fundingAccountService.releaseFromLoan(1L,r.getAmountPaid(),r.getLoan().getId(), r.getLoan().getBorrowerName());
                    Loan loan = r.getLoan();
                    loan.setOutstandingBalance(loan.getOutstandingBalance().subtract(r.getAmountPaid()));
                }
            }
            return repaymentRepository.save(r);
        });
    }

}
