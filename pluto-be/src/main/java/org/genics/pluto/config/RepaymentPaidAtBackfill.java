package org.genics.pluto.config;

import lombok.RequiredArgsConstructor;
import org.genics.pluto.repository.RepaymentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Fills paidAt for repayments marked PAID before the column existed.
 * Idempotent — only touches PAID rows where paidAt is still null.
 */
@Component
@RequiredArgsConstructor
public class RepaymentPaidAtBackfill implements CommandLineRunner {

    private final RepaymentRepository repaymentRepository;

    @Override
    public void run(String... args) {
        repaymentRepository.backfillPaidAt();
    }
}
