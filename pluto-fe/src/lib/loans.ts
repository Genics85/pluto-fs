import type { Loan } from "../types/loan";

/**
 * Interest earned on loans that have been fully repaid (status PAID):
 * principal × interest rate for each. Loans still being repaid count nothing
 * until they are marked PAID.
 */
export function interestReceived(loans: Loan[]) {
  return loans
    .filter((loan) => loan.status === "PAID")
    .reduce(
      (sum, loan) =>
        sum + ((loan.principalAmount || 0) * (loan.interestRate || 0)) / 100,
      0,
    );
}
