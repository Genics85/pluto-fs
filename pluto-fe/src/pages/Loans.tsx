import { useState, useEffect } from "react";
import { Search, Filter, Download, Eye, X, PlusCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { usePageTitle } from "../hooks/usePageTitle";
import { useGetLoansQuery } from "../services/loansApi";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

// loans are fetched from the API: useGetLoansQuery() provides the live data

export default function AllLoans() {
  usePageTitle("All Loans");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();
  const location = useLocation();

  const { data: apiLoans = [], isLoading, isError } = useGetLoansQuery();

  // Check if there's a borrower filter from navigation state
  const borrowerFilter = location.state?.borrowerName;

  // Set search term from borrower filter when component mounts or location changes
  useEffect(() => {
    if (borrowerFilter) {
      setSearchTerm(borrowerFilter);
    }
  }, [borrowerFilter]);

  const loans = apiLoans.map((l) => {
    const borrowerName = l.borrowerName || "Unknown Customer";
    const principal = new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(l.principalAmount || 0);
    const startDate = l.startDate
      ? new Date(l.startDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "-";
    // Calculate actual amount paid from repayments with PAID status
    const actualAmountPaid = l.repayments
      ?.filter((r) => r.repaymentStatus === "PAID")
      .reduce((sum, r) => sum + (r.amountPaid || 0), 0) || 0;
    const amountPaid = new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(actualAmountPaid);
    const status = l.status || "ACTIVE";

    return {
      id: l.id,
      displayId: typeof l.id === "number" ? `LN-${l.id}` : String(l.id),
      borrowerName: borrowerName,
      principal,
      startDate,
      status,
      amountPaid,
    };
  });

  const filteredLoans = loans.filter((loan) => {
    const matchesSearch =
      loan.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(loan.displayId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || loan.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Layout>
      <div className="page-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title text-2xl sm:text-3xl">All Loans</h1>
          <p className="page-description text-sm sm:text-base">View and manage all loan records.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="gap-2 flex-1 sm:flex-none">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2 flex-1 sm:flex-none" onClick={() => navigate("/loans/new")}>
            <PlusCircle className="h-4 w-4" />
            New Loan
          </Button>
        </div>
      </div>

      {/* Active Filter Badge */}
      {borrowerFilter && (
        <div className="mb-4 flex items-center gap-2">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-sm">
            <span>Filtered by: {borrowerFilter}</span>
            <button
              onClick={() => {
                setSearchTerm("");
                navigate("/loans", { replace: true, state: {} });
              }}
              className="hover:bg-primary/20 rounded p-0.5 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by loan ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="defaulted">Defaulted</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading loans...</div>
        ) : isError ? (
          <div className="text-center py-8 text-muted-foreground">Failed to load loans</div>
        ) : filteredLoans.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No loans found</div>
        ) : (
          filteredLoans.map((loan) => (
            <div
              key={loan.id}
              className="bg-card rounded-xl border border-border/50 shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/loans/${loan.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-foreground">{loan.displayId}</p>
                  <p className="text-sm text-muted-foreground">{loan.borrowerName.toUpperCase()}</p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    loan.status.toLowerCase() === "active"
                      ? "bg-blue-100 text-blue-800"
                      : loan.status.toLowerCase() === "paid"
                      ? "bg-green-100 text-green-800"
                      : loan.status.toLowerCase() === "defaulted"
                      ? "bg-red-100 text-red-800"
                      : loan.status.toLowerCase() === "cancelled"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {loan.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Principal</p>
                  <p className="font-medium">{loan.principal}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Amount Paid</p>
                  <p className="font-medium text-success">{loan.amountPaid}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Start Date</p>
                  <p className="font-medium">{loan.startDate}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Loan ID</th>
                <th>Customer</th>
                <th>Principal</th>
                <th>Repayment Start Date</th>
                <th>Amount Paid</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    Loading loans...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    Failed to load loans
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => (
                  <tr key={loan.id}>
                    <td className="font-medium text-foreground">{loan.displayId}</td>
                    <td>{loan.borrowerName.toUpperCase()}</td>
                    <td className="font-medium">{loan.principal}</td>
                    <td className="text-muted-foreground">{loan.startDate}</td>
                    <td className="font-medium text-success">
                      {loan.amountPaid}
                    </td>
                    <td>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          loan.status.toLowerCase() === "active"
                            ? "bg-blue-100 text-blue-800"
                            : loan.status.toLowerCase() === "paid"
                            ? "bg-green-100 text-green-800"
                            : loan.status.toLowerCase() === "defaulted"
                            ? "bg-red-100 text-red-800"
                            : loan.status.toLowerCase() === "cancelled"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {loan.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        onClick={() => navigate(`/loans/${loan.id}`)}
                      >
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
