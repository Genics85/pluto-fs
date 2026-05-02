package org.genics.pluto.repository;

import org.genics.pluto.model.Repayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface RepaymentRepository extends JpaRepository<Repayment, Long> {

    List<Repayment> findByLoanId(Long loanId);

    List<Repayment> findByLoanIdOrderByPaymentDateDesc(Long loanId);

    List<Repayment> findByPaymentDateBetween(LocalDate start, LocalDate end);

}

