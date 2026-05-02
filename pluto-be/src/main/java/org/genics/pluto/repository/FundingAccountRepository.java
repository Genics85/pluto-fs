package org.genics.pluto.repository;

import org.genics.pluto.model.FundingAccount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FundingAccountRepository extends JpaRepository<FundingAccount, Long> {
}

