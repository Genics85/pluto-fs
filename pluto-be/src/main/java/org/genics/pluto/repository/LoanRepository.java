package org.genics.pluto.repository;

import org.genics.pluto.enums.LoanStatus;
import org.genics.pluto.model.Loan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoanRepository extends JpaRepository<Loan, Long> {

    List<Loan> findByBorrowerId(Long userId);

    List<Loan> findByStatus(LoanStatus status);

    List<Loan> findByBorrowerIdAndStatus(Long userId, LoanStatus status);

}

