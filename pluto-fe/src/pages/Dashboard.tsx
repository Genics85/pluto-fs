import { useMemo } from "react";
import { Layout } from "../components/layout/Layout";
import { usePageTitle } from "../hooks/usePageTitle";
import {
  DollarSign,
  CreditCard,
  Users,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
  CalendarClock,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useGetLoansQuery } from "../services/loansApi";
import { useGetBorrowersQuery } from "../services/borrowerApi";
import { useGetFundingAccountsQuery } from "../services/accountApi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LabelList,
} from "recharts";

export default function Dashboard() {
  usePageTitle("Dashboard");
  const navigate = useNavigate();

  // Fetch all data from APIs
  const { data: loans = [], isLoading: loansLoading } = useGetLoansQuery();
  const { data: borrowers = [], isLoading: borrowersLoading } =
    useGetBorrowersQuery();
  const { data: accounts = [], isLoading: accountsLoading } =
    useGetFundingAccountsQuery();

  const isLoading = loansLoading || borrowersLoading || accountsLoading;

  // Calculate loan statistics
  const activeLoans = loans.filter((l) => l.status === "ACTIVE");
  const paidLoans = loans.filter((l) => l.status === "PAID");
  const defaultedLoans = loans.filter((l) => l.status === "DEFAULTED");

  const totalOutstanding = loans.reduce(
    (sum, loan) => sum + (loan.outstandingBalance || 0),
    0,
  );

  // Calculate interest earned only from PAID loans
  const totalInterestEarned = paidLoans.reduce(
    (sum, loan) =>
      sum + ((loan.totalPayable || 0) - (loan.principalAmount || 0)),
    0,
  );

  // Calculate expected weekly repayments from active loans
  const expectedWeeklyRepayments = activeLoans.reduce((sum, loan) => {
    const weeklyPayment =
      loan.durationWeeks > 0 ? loan.totalPayable / loan.durationWeeks : 0;
    return sum + weeklyPayment;
  }, 0);

  // Calculate funding statistics
  const totalAvailable = accounts.reduce(
    (sum, acc) => sum + acc.availableBalance,
    0,
  );
  const totalReserved = accounts.reduce(
    (sum, acc) => sum + acc.reservedBalance,
    0,
  );
  const totalFundsBalance = totalOutstanding + totalAvailable;
  const interestReceivable = totalOutstanding - totalReserved;

  // Get recent loans (last 5)
  const recentLoans = [...loans]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  // Get recent borrowers (last 5)
  const recentBorrowers = [...borrowers]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  // Prepare chart data - loans over time (grouped by month)
  const loanTrendData = useMemo(() => {
    if (loans.length === 0) return [];

    // Group loans by month
    const monthlyData: Record<
      string,
      { month: string; loans: number; amount: number }
    > = {};

    loans.forEach((loan) => {
      const date = new Date(loan.startDate);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}`;
      const monthLabel = new Intl.DateTimeFormat("en-US", {
        month: "2-digit",
        year: "2-digit",
      }).format(date);

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthLabel, loans: 0, amount: 0 };
      }
      monthlyData[monthKey].loans += 1;
      monthlyData[monthKey].amount += loan.principalAmount || 0;
    });

    // Sort by date and return array
    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, data]) => data);
  }, [loans]);

  // Loan status distribution for bar chart
  const statusData = useMemo(
    () => [
      {
        name: "Active",
        value: activeLoans.length,
        color: "hsl(142, 76%, 36%)",
      },
      { name: "Paid", value: paidLoans.length, color: "hsl(221, 83%, 53%)" },
      {
        name: "Defaulted",
        value: defaultedLoans.length,
        color: "hsl(0, 84%, 60%)",
      },
    ],
    [activeLoans.length, paidLoans.length, defaultedLoans.length],
  );

  // Get repayments with payment dates in the current week (Saturday to Friday)
  const repaymentsThisWeek = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    const daysToSaturday = (now.getDay() + 1) % 7;
    startOfWeek.setDate(now.getDate() - daysToSaturday);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return loans
      .flatMap((loan) =>
        (loan.repayments || [])
          .filter((r) => {
            const date = new Date(r.paymentDate);
            return date >= startOfWeek && date < endOfWeek;
          })
          .map((r) => ({
            ...r,
            borrowerName: loan.borrowerName,
            loanId: loan.id,
          })),
      )
      .sort(
        (a, b) =>
          new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime(),
      );
  }, [loans]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "badge-active";
      case "paid":
        return "badge-success";
      case "defaulted":
        return "badge-danger";
      default:
        return "badge-inactive";
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Dashboard
            </h1>
            <p className="mt-1 text-sm sm:text-base text-muted-foreground">
              Overview of your loan portfolio and finances
            </p>
          </div>
          <Link to="/loans/new">
            <Button className="gap-2 w-full sm:w-auto">
              <CreditCard className="h-4 w-4" />
              New Loan
            </Button>
          </Link>
        </div>

        {/* Key Metrics Row */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-4">
          
          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Available Balance
                </p>
                <p className="mt-2 text-2xl font-bold text-violet-500">
                  {formatCurrency(totalAvailable)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-violet-500/10">
                <Wallet className="h-5 w-5 text-violet-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                Across {accounts.length} funding account
                {accounts.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div className="">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Outstanding
                </p>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {formatCurrency(totalOutstanding)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                From {activeLoans.length} active loans
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Expected This Week
                </p>
                <p className="mt-2 text-2xl font-bold text-blue-500">
                  {formatCurrency(expectedWeeklyRepayments)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <CalendarClock className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                Weekly repayments due
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Interest Earned
                </p>
                <p className="mt-2 text-2xl font-bold text-success">
                  {formatCurrency(totalInterestEarned)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-success/10">
                <ArrowUpRight className="h-5 w-5 text-success" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                From {paidLoans.length} paid loans
              </span>
            </div>
          </div>
        </div>

        {/* Loan Stats & Funding Overview Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Repayments This Week */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium text-muted-foreground">
                Repayments This Week
              </h2>
              <span className="text-xs text-muted-foreground">
                {repaymentsThisWeek.length} repayment
                {repaymentsThisWeek.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden max-h-[220px] overflow-y-auto">
              {repaymentsThisWeek.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No repayments scheduled this week
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {repaymentsThisWeek.map((repayment) => (
                    <div
                      key={repayment.id}
                      className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/loans/${repayment.loanId}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            repayment.repaymentStatus === "PAID"
                              ? "bg-success/10"
                              : repayment.repaymentStatus === "OVERDUE"
                                ? "bg-destructive/10"
                                : "bg-blue-500/10"
                          }`}
                        >
                          {repayment.repaymentStatus === "PAID" ? (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          ) : repayment.repaymentStatus === "OVERDUE" ? (
                            <XCircle className="h-4 w-4 text-destructive" />
                          ) : (
                            <Clock className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {repayment.borrowerName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(repayment.paymentDate)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">
                          {formatCurrency(repayment.amountPaid)}
                        </p>
                        <span
                          className={getStatusBadge(
                            repayment.repaymentStatus.toLowerCase(),
                          )}
                        >
                          {repayment.repaymentStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Funding Overview */}
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-4">
              Funding Overview
            </h2>
            <div className="bg-card rounded-xl border border-border/50 shadow-sm p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Total Balance
                  </span>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(totalFundsBalance)}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <ArrowDownRight className="h-5 w-5 text-success" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Available
                  </span>
                </div>
                <p className="text-lg font-bold text-success">
                  {formatCurrency(totalAvailable)}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <DollarSign className="h-5 w-5 text-blue-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Total Outstanding
                  </span>
                </div>
                <p className="text-lg font-bold text-blue-500">
                  {formatCurrency(totalOutstanding)}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted/10">
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Principal In Arrears
                  </span>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(totalReserved)}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <ArrowUpRight className="h-5 w-5 text-amber-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Interest Receivable
                  </span>
                </div>
                <p className="text-lg font-bold text-amber-500">
                  {formatCurrency(interestReceivable)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Loan Disbursements Over Time */}
          <div className="bg-card rounded-xl border border-border/50 shadow-sm p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Loan Disbursements Over Time
            </h3>
            {loanTrendData.length === 0 ? (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No loan data available
              </div>
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={loanTrendData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorAmount"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(142, 76%, 36%)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(142, 76%, 36%)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(214, 32%, 91%)"
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }}
                      axisLine={{ stroke: "hsl(214, 32%, 91%)" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }}
                      axisLine={{ stroke: "hsl(214, 32%, 91%)" }}
                      tickLine={false}
                      tickFormatter={(value) =>
                        `₵${(value / 1000).toFixed(0)}k`
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(214, 32%, 91%)",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                      formatter={(value: number, name: string) => [
                        name === "amount" ? formatCurrency(value) : value,
                        name === "amount" ? "Total Amount" : "Loans Count",
                      ]}
                      labelStyle={{ fontWeight: 600 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="hsl(142, 76%, 36%)"
                      strokeWidth={2}
                      fill="url(#colorAmount)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Loan Status Distribution */}
          <div className="bg-card rounded-xl border border-border/50 shadow-sm p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Loan Status Distribution ({loans.length})
            </h3>
            {loans.length === 0 ? (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No loan data available
              </div>
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statusData}
                    margin={{ top: 24, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(214, 32%, 91%)"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }}
                      axisLine={{ stroke: "hsl(214, 32%, 91%)" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }}
                      axisLine={{ stroke: "hsl(214, 32%, 91%)" }}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(214, 32%, 91%)",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                      formatter={(value: number) => [value, "Loans"]}
                      labelStyle={{ fontWeight: 600 }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <LabelList
                        dataKey="value"
                        position="top"
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          fill: "hsl(215, 16%, 30%)",
                        }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity & Accounts Section */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Loans */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Recent Loans
              </h2>
              <Link
                to="/loans"
                className="text-sm font-medium text-primary hover:underline"
              >
                View all →
              </Link>
            </div>
            <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
              {recentLoans.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No loans yet
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {recentLoans.map((loan) => (
                    <div
                      key={loan.id}
                      className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/loans/${loan.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {loan.borrowerName || "Unknown Customer"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            LN-{loan.id} • {formatDate(loan.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          {formatCurrency(loan.principalAmount)}
                        </p>
                        <span className={getStatusBadge(loan.status)}>
                          {loan.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Borrowers */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Recent Customers
              </h2>
              <Link
                to="/borrowers"
                className="text-sm font-medium text-primary hover:underline"
              >
                View all →
              </Link>
            </div>
            <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
              {recentBorrowers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No customers yet
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {recentBorrowers.map((borrower) => (
                    <div
                      key={borrower.id}
                      className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                          <Users className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {borrower.firstName} {borrower.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {borrower.phone}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          {borrower.loans?.length || 0} loans
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
