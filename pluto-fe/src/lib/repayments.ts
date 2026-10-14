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

const DAY_MS = 24 * 60 * 60 * 1000;
const GRACE_DAYS = 3;

/** Whole days between two dates, ignoring the time of day. */
function daysBetween(from: Date, to: Date) {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / DAY_MS);
}

/**
 * How a set of repayments has gone so far, using the same grading as the
 * backend score: paid within 3 days of due counts as on time.
 */
export function paymentHabit(repayments: Repayment[], today = new Date()) {
  const lateness: number[] = [];
  let onTime = 0;
  let late = 0;
  let missed = 0;

  for (const r of repayments) {
    const due = new Date(r.paymentDate);
    const paid = paidOn(r);
    if (paid) {
      const days = Math.max(0, daysBetween(due, paid));
      lateness.push(days);
      if (days <= GRACE_DAYS) onTime++;
      else late++;
    } else if (daysBetween(due, today) > GRACE_DAYS) {
      missed++;
    }
  }

  lateness.sort((a, b) => a - b);
  const typicalDaysLate =
    lateness.length > 0 ? lateness[Math.floor(lateness.length / 2)] : null;

  return { onTime, late, missed, typicalDaysLate };
}

/** A one-line, human description of a payment habit. */
export function describeHabit({
  onTime,
  late,
  missed,
  typicalDaysLate,
}: ReturnType<typeof paymentHabit>) {
  if (onTime + late + missed === 0) return "No repayments are due yet.";

  let habit: string;
  if (typicalDaysLate === null) habit = "Hasn't made any payments yet";
  else if (typicalDaysLate === 0) habit = "Usually pays on or before the due date";
  else if (typicalDaysLate <= GRACE_DAYS) habit = "Usually pays within a few days of the due date";
  else if (typicalDaysLate <= 7) habit = "Usually pays about a week late";
  else if (typicalDaysLate <= 14) habit = "Usually pays up to two weeks late";
  else habit = "Usually pays more than two weeks late";

  if (missed === 0) return `${habit}.`;
  return `${habit}, with ${missed} overdue repayment${missed !== 1 ? "s" : ""} still unpaid.`;
}

export interface OverdueRepayment {
  repayment: Repayment;
  loanId: number;
  daysOverdue: number;
}

export interface CustomerOverdue {
  borrowerId: number;
  borrowerName: string;
  count: number;
  amount: number;
  oldestDaysOverdue: number;
  loanIds: number[];
}

// Inclusive upper bounds in days; the last bucket catches everything older.
const AGE_BUCKETS = [
  { label: "1 – 7 days", max: 7 },
  { label: "8 – 14 days", max: 14 },
  { label: "15 – 30 days", max: 30 },
  { label: "Over 30 days", max: Infinity },
];

/**
 * Unpaid repayments whose due date has passed, across every loan that is
 * still owed (cancelled and fully paid loans are left out).
 */
export function overdueSummary(loans: Loan[], today = new Date()) {
  const overdue: OverdueRepayment[] = loans
    .filter((loan) => loan.status === "ACTIVE" || loan.status === "DEFAULTED")
    .flatMap((loan) =>
      (loan.repayments || [])
        .filter((r) => r.repaymentStatus !== "PAID")
        .map((r) => ({
          repayment: r,
          loanId: loan.id,
          daysOverdue: daysBetween(new Date(r.paymentDate), today),
        }))
        .filter((o) => o.daysOverdue > 0),
    );

  const byCustomer = new Map<number, CustomerOverdue>();
  for (const o of overdue) {
    const loan = loans.find((l) => l.id === o.loanId)!;
    const entry = byCustomer.get(loan.borrowerId) ?? {
      borrowerId: loan.borrowerId,
      borrowerName: loan.borrowerName || "Unknown Customer",
      count: 0,
      amount: 0,
      oldestDaysOverdue: 0,
      loanIds: [],
    };
    entry.count++;
    entry.amount += o.repayment.amountPaid || 0;
    entry.oldestDaysOverdue = Math.max(entry.oldestDaysOverdue, o.daysOverdue);
    if (!entry.loanIds.includes(o.loanId)) entry.loanIds.push(o.loanId);
    byCustomer.set(loan.borrowerId, entry);
  }

  const aging = AGE_BUCKETS.map((bucket, i) => {
    const min = i === 0 ? 1 : AGE_BUCKETS[i - 1].max + 1;
    const inBucket = overdue.filter(
      (o) => o.daysOverdue >= min && o.daysOverdue <= bucket.max,
    );
    return {
      label: bucket.label,
      count: inBucket.length,
      amount: inBucket.reduce((sum, o) => sum + (o.repayment.amountPaid || 0), 0),
    };
  });

  return {
    count: overdue.length,
    amount: overdue.reduce((sum, o) => sum + (o.repayment.amountPaid || 0), 0),
    loansAffected: new Set(overdue.map((o) => o.loanId)).size,
    oldestDaysOverdue: overdue.reduce((max, o) => Math.max(max, o.daysOverdue), 0),
    aging,
    customers: [...byCustomer.values()].sort((a, b) => b.amount - a.amount),
  };
}
