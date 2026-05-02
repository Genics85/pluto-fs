package org.genics.pluto.repository;

import org.genics.pluto.model.FundingTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FundingTransactionRepository extends JpaRepository<FundingTransaction, Long> {

    List<FundingTransaction> findByFundingAccountIdOrderByCreatedAtDesc(Long accountId);

}

