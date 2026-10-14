package org.genics.pluto.util;

import org.genics.pluto.enums.RepaymentStatus;
import org.genics.pluto.model.Repayment;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Objects;
import java.util.stream.Stream;

/**
 * Grades repayments by how late they were paid (0-100) and averages them into
 * a score. Repayments not yet due, or unpaid but still within the grace period,
 * are left out.
 */
public final class RepaymentScore {

    private static final int GRACE_DAYS = 3;

    private RepaymentScore() {
    }

    public static Integer pointsFor(Repayment r, LocalDate today) {
        LocalDate due = r.getPaymentDate();
        if (due == null) return null;

        if (r.getRepaymentStatus() == RepaymentStatus.PAID) {
            LocalDate paidOn = r.getPaidAt() != null ? r.getPaidAt().toLocalDate()
                    : r.getUpdatedAt() != null ? r.getUpdatedAt().toLocalDate()
                    : due;
            long daysLate = ChronoUnit.DAYS.between(due, paidOn);
            if (daysLate <= GRACE_DAYS) return 100;
            if (daysLate <= 7) return 75;
            if (daysLate <= 14) return 50;
            return 25;
        }

        return ChronoUnit.DAYS.between(due, today) > GRACE_DAYS ? 0 : null;
    }

    public static Integer average(Stream<Repayment> repayments, LocalDate today) {
        var stats = repayments
                .map(r -> pointsFor(r, today))
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .summaryStatistics();
        return stats.getCount() == 0 ? null : (int) Math.round(stats.getAverage());
    }
}
