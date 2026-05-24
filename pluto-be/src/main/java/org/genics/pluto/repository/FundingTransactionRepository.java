package org.genics.pluto.repository;

import org.genics.pluto.model.FundingTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FundingTransactionRepository extends JpaRepository<FundingTransaction, Long> {

    Page<FundingTransaction> findByFundingAccountIdOrderByCreatedAtDesc(Long accountId, Pageable pageable);

}

