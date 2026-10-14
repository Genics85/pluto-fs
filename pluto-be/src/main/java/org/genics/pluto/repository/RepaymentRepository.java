package org.genics.pluto.repository;

import org.genics.pluto.model.Repayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

public interface RepaymentRepository extends JpaRepository<Repayment, Long> {

    List<Repayment> findByLoanId(Long loanId);

    List<Repayment> findByLoanIdOrderByPaymentDateDesc(Long loanId);

    List<Repayment> findByPaymentDateBetween(LocalDate start, LocalDate end);

    // PAID rows are locked once paid, so updatedAt is when the payment was registered.
    @Modifying
    @Transactional
    @Query("update Repayment r set r.paidAt = r.updatedAt where r.repaymentStatus = org.genics.pluto.enums.RepaymentStatus.PAID and r.paidAt is null")
    int backfillPaidAt();

}

