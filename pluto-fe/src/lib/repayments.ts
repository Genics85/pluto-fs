import type { Loan, Repayment } from "../types/loan";

/** The current repayment week, Saturday 00:00 to the following Saturday 00:00. */
export function currentWeek(now = new Date()) {
  const start = new Date(now);
  start.setDate(now.getDate() - ((now.getDay() + 1) % 7));
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { start, end };
}

/** When the payment was registered; older rows predate paidAt and fall back to updatedAt. */
export function paidOn(r: Repayment): Date | null {
  if (r.repaymentStatus !== "PAID") return null;
  const at = r.paidAt ?? r.updatedAt;
  return at ? new Date(at) : null;
}

/**
 * The repayments a loan is "on" this week: every one registered as paid this
 * week, or, if none was, its next unpaid one however far out it falls.
 */
export function currentRepayments(
  loan: Loan,
  week = currentWeek(),
): Repayment[] {
  const repayments = [...(loan.repayments || [])].sort(
    (a, b) =>
      new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime(),
  );
  const paidThisWeek = repayments.filter((r) => {
    const date = paidOn(r);
    return date !== null && date >= week.start && date < week.end;
  });
  if (paidThisWeek.length > 0) return paidThisWeek;
  const nextUnpaid = repayments.find((r) => r.repaymentStatus !== "PAID");
  return nextUnpaid ? [nextUnpaid] : [];
}
