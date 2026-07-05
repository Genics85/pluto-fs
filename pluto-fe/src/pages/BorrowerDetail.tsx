import { Fragment, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronRight, Phone, Mail, MapPin, CreditCard, MessageCircle } from "lucide-react";
import { Layout } from "../components/layout/Layout";
import { usePageTitle } from "../hooks/usePageTitle";
import { useGetBorrowerByIdQuery } from "../services/borrowerApi";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(amount);

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));

const statusClass: Record<string, string> = {
  PAID: "bg-green-100 text-green-800",
  PENDING: "bg-blue-100 text-blue-800",
  OVERDUE: "bg-red-100 text-red-800",
};

export default function BorrowerDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: borrower, isLoading, isError } = useGetBorrowerByIdQuery(Number(id), { skip: !id });
  const [collapsedLoanIds, setCollapsedLoanIds] = useState<Set<number>>(new Set());

  usePageTitle(borrower ? `${borrower.firstName} ${borrower.lastName}` : "Customer");

  const toggleLoan = (loanId: number) => {
    setCollapsedLoanIds((prev) => {
      const next = new Set(prev);
      if (next.has(loanId)) next.delete(loanId);
      else next.add(loanId);
      return next;
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-16">
          <p className="text-muted-foreground">Loading customer...</p>
        </div>
      </Layout>
    );
  }

  if (isError || !borrower) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-16">
          <p className="text-destructive">Customer not found.</p>
        </div>
      </Layout>
    );
  }

  const allRepayments = (borrower.loans || []).flatMap((loan) => loan.repayments || []);

  const loansWithRepayments = (borrower.loans || [])
    .filter((loan) => (loan.repayments || []).length > 0)
    .map((loan) => ({
      ...loan,
      repayments: [...loan.repayments].sort(
        (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      ),
    }))
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  const totalBorrowed = (borrower.loans || []).reduce((s, l) => s + l.principalAmount, 0);
  const paidRepayments = allRepayments.filter((r) => r.repaymentStatus === "PAID").length;

  return (
    <Layout>
      <div className="mb-6">
        <Link to="/borrowers" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Customers
        </Link>
      </div>

      {/* Header */}
      <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-primary">
              {borrower.firstName?.[0]}{borrower.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground">
              {borrower.firstName} {borrower.lastName}
            </h1>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                {borrower.phone || "—"}
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 shrink-0" />
                {borrower.whatsapp
                  ? <a href={`https://wa.me/${borrower.whatsapp.replace(/^0/, "233")}`} target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">{borrower.whatsapp}</a>
                  : "—"}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                {borrower.email || "—"}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                {borrower.location || "—"}
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 shrink-0" />
                {borrower.ghanaCard || "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border/50">
          <div>
            <p className="text-xs text-muted-foreground">Total Loans</p>
            <p className="text-xl font-bold text-foreground">{(borrower.loans || []).length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Borrowed</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(totalBorrowed)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Repayments Made</p>
            <p className="text-xl font-bold text-success">{paidRepayments}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Pending / Overdue</p>
            <p className="text-xl font-bold text-destructive">
              {allRepayments.filter((r) => r.repaymentStatus !== "PAID").length}
            </p>
          </div>
        </div>
      </div>

      {/* Repayment History */}
      <h2 className="text-sm font-medium text-muted-foreground mb-3">Repayment History</h2>
      <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Due Date</TableHead>
              <TableHead>Paid On</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loansWithRepayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  No repayments found.
                </TableCell>
              </TableRow>
            ) : (
              loansWithRepayments.map((loan) => {
                const isCollapsed = collapsedLoanIds.has(loan.id);
                return (
                  <Fragment key={loan.id}>
                    <TableRow
                      className="bg-muted/50 hover:bg-muted cursor-pointer select-none"
                      onClick={() => toggleLoan(loan.id)}
                    >
                      <TableCell colSpan={5} className="py-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isCollapsed ? (
                              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                            <Link
                              to={`/loans/${loan.id}`}
                              className="text-primary hover:underline font-medium"
                              onClick={(e) => e.stopPropagation()}
                            >
                              LN-{loan.id}
                            </Link>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatCurrency(loan.principalAmount)} ·{" "}
                            {loan.repayments.filter((r) => r.repaymentStatus === "PAID").length}/{loan.repayments.length} repayments paid
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                    {!isCollapsed && loan.repayments.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-muted-foreground">{formatDate(r.paymentDate)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {r.repaymentStatus === "PAID" && r.updatedAt ? formatDate(r.updatedAt) : "—"}
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(r.amountPaid)}</TableCell>
                        <TableCell className="text-muted-foreground capitalize">{r.paymentMethod.replace(/_/g, " ")}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass[r.repaymentStatus] ?? "bg-gray-100 text-gray-600"}`}>
                            {r.repaymentStatus}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
}
