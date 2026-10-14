import { Link } from "react-router-dom";
import { AlertTriangle, ClipboardList } from "lucide-react";
import type { Loan } from "../../types/loan";
import { overdueSummary } from "../../lib/repayments";
import { useGetBorrowersQuery } from "../../services/borrowerApi";
import { ScoreBadge } from "../ScoreBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

interface LoansSummaryDialogProps {
  loans: Loan[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

function Stat({ label, value, tone = "text-foreground" }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/30 p-3 min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-base sm:text-lg font-bold break-words ${tone}`}>{value}</p>
    </div>
  );
}

export function LoansSummaryDialog({ loans, open, onOpenChange }: LoansSummaryDialogProps) {
  // Only for each customer's score; usually already cached from the Customers page.
  const { data: borrowers = [] } = useGetBorrowersQuery(undefined, { skip: !open });
  const scoreOf = (id: number) => borrowers.find((b) => b.id === id)?.score ?? null;

  const summary = overdueSummary(loans);
  const activeLoans = loans.filter((l) => l.status === "ACTIVE");
  const totalOutstanding = activeLoans.reduce((sum, l) => sum + (l.outstandingBalance || 0), 0);
  const overdueShare = totalOutstanding > 0 ? Math.round((summary.amount / totalOutstanding) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-6 text-left">
            <ClipboardList className="h-5 w-5 text-primary" />
            Loans Summary
          </DialogTitle>
          <DialogDescription className="text-left">
            Overdue repayments across all active and defaulted loans, as of today. A repayment is overdue once its due
            date has passed and it hasn't been marked as paid.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 sm:space-y-6">
          {/* Headline numbers */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Stat label="Active Loans" value={activeLoans.length} />
            <Stat label="Total Outstanding" value={formatCurrency(totalOutstanding)} />
            <Stat
              label="Overdue Amount"
              value={formatCurrency(summary.amount)}
              tone={summary.amount > 0 ? "text-destructive" : "text-success"}
            />
            <Stat
              label="Overdue Repayments"
              value={summary.count}
              tone={summary.count > 0 ? "text-destructive" : "text-success"}
            />
            <Stat label="Customers Overdue" value={summary.customers.length} />
            <Stat
              label="Oldest Overdue"
              value={summary.count > 0 ? `${summary.oldestDaysOverdue} days` : "—"}
            />
          </div>

          {summary.count === 0 ? (
            <div className="rounded-lg border border-border/50 py-8 text-center text-sm text-muted-foreground">
              No overdue repayments. Everything due so far has been paid.
            </div>
          ) : (
            <>
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <span>
                  {summary.count} overdue repayment{summary.count !== 1 ? "s" : ""} worth{" "}
                  <strong className="text-foreground">{formatCurrency(summary.amount)}</strong> across{" "}
                  {summary.loansAffected} loan{summary.loansAffected !== 1 ? "s" : ""} — {overdueShare}% of what active
                  loans still owe.
                </span>
              </p>

              {/* How overdue */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">How Overdue</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {summary.aging.map((bucket) => (
                    <div key={bucket.label} className="rounded-lg border border-border/50 p-3 min-w-0">
                      <p className="text-xs text-muted-foreground">{bucket.label}</p>
                      <p className="mt-1 font-semibold text-foreground">
                        {bucket.count} repayment{bucket.count !== 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(bucket.amount)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* By customer */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Overdue by Customer</h3>

                {/* Phones: one card per customer */}
                <div className="space-y-3 sm:hidden">
                  {summary.customers.map((c) => (
                    <div key={c.borrowerId} className="rounded-lg border border-border/50 p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/borrowers/${c.borrowerId}`}
                          onClick={() => onOpenChange(false)}
                          className="font-medium text-foreground hover:text-primary hover:underline min-w-0 break-words"
                        >
                          {c.borrowerName}
                        </Link>
                        <ScoreBadge score={scoreOf(c.borrowerId)} />
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Overdue</p>
                          <p className="font-medium">{c.count}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Amount</p>
                          <p className="font-semibold text-destructive">{formatCurrency(c.amount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Oldest</p>
                          <p className="font-medium">{c.oldestDaysOverdue}d</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {c.loanIds.map((id) => (
                          <Link
                            key={id}
                            to={`/loans/${id}`}
                            onClick={() => onOpenChange(false)}
                            className="text-xs text-primary hover:underline"
                          >
                            LN-{id}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tablet and up: table */}
                <div className="hidden sm:block rounded-lg border border-border/50 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead className="text-center">Overdue</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-center">Oldest</TableHead>
                        <TableHead>Loans</TableHead>
                        <TableHead>Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summary.customers.map((c) => (
                        <TableRow key={c.borrowerId}>
                          <TableCell className="font-medium">
                            <Link
                              to={`/borrowers/${c.borrowerId}`}
                              onClick={() => onOpenChange(false)}
                              className="text-foreground hover:text-primary hover:underline"
                            >
                              {c.borrowerName}
                            </Link>
                          </TableCell>
                          <TableCell className="text-center">{c.count}</TableCell>
                          <TableCell className="text-right font-semibold text-destructive">
                            {formatCurrency(c.amount)}
                          </TableCell>
                          <TableCell className="text-center text-muted-foreground">{c.oldestDaysOverdue}d</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1.5">
                              {c.loanIds.map((id) => (
                                <Link
                                  key={id}
                                  to={`/loans/${id}`}
                                  onClick={() => onOpenChange(false)}
                                  className="text-xs text-primary hover:underline"
                                >
                                  LN-{id}
                                </Link>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <ScoreBadge score={scoreOf(c.borrowerId)} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
