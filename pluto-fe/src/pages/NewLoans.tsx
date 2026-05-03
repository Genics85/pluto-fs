import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { usePageTitle } from "../hooks/usePageTitle";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useGetBorrowersQuery } from "../services/borrowerApi";
import { ArrowLeft, Calculator } from "lucide-react";
import { useAddLoanMutation } from "../services/loansApi";
import type { LoanAddRequest } from "../types/loan";
import { toast } from "sonner";

export default function NewLoan() {
  usePageTitle("Create New Loan");
  const navigate = useNavigate();

  const [loanDetails, setLoanDetails] = useState<LoanAddRequest>({
    borrowerId: 0,
    principalAmount: 0,
    interestRate: 0,
    durationWeeks: 0,
    startDate: "",
    totalPayable: 0,
  });

  const updateFields = (fields: Partial<LoanAddRequest>) => {
    setLoanDetails((prev) => {
      return { ...prev, ...fields };
    });
  };

  const formatCurrency = (amount: number) => {
    if (isNaN(amount)) return "GHS0.00";
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(amount);
  };

  const [addLoan, { isLoading }] = useAddLoanMutation();

  const {
    data: borrowers = [],
    isLoading: borrowersLoading,
    isError: borrowersError,
  } = useGetBorrowersQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!loanDetails.borrowerId) {
      toast.error("Please select a customer");
      return;
    }
    if (!loanDetails.principalAmount || loanDetails.principalAmount <= 0) {
      toast.error("Please enter a valid principal amount");
      return;
    }
    if (!loanDetails.interestRate || loanDetails.interestRate < 0) {
      toast.error("Please enter a valid interest rate");
      return;
    }
    if (!loanDetails.durationWeeks || loanDetails.durationWeeks <= 0) {
      toast.error("Please select a loan term");
      return;
    }
    if (!loanDetails.startDate) {
      toast.error("Please select a start date");
      return;
    }

    try {
      // Calculate and set totalPayable before submission
      const loanData = {
        ...loanDetails,
        totalPayable: totalPayable(),
      };

      await addLoan(loanData).unwrap();
      toast.success("Loan created successfully!");
      navigate("/loans");
    } catch (err) {
      toast.error("Failed to create loan");
      console.error(err);
    }
  };

  const weeklyPayment = () => {
    const principal = loanDetails.principalAmount;
    const numberOfPayments = loanDetails.durationWeeks;

    if (!principal || !numberOfPayments || numberOfPayments === 0) {
      return 0;
    }

    return totalPayable() / numberOfPayments;
  };

  const totalInterest = () => {
    const principal = loanDetails.principalAmount;

    if (!principal) {
      return 0;
    }

    return principal * (loanDetails.interestRate / 100);
  };

  const totalPayable = () => {
    const principal = loanDetails.principalAmount;

    if (!principal) {
      return 0;
    }

    return principal + totalInterest();
  };

  return (
    <Layout>
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Back Button */}
        <Link to="/loans">
          <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Back to Loans
          </Button>
        </Link>

        {/* Header */}
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Create New Loan
          </h1>
          <p className="mt-1 text-sm sm:text-base text-muted-foreground">
            Enter the loan details to generate a repayment schedule
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <div className="rounded-xl bg-card p-4 sm:p-6 shadow-sm ring-1 ring-border">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Loan Details
            </h2>
            <div className="mt-4 sm:mt-6 grid gap-4 sm:gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="borrower">Customer</Label>
                <Select
                  value={
                    loanDetails.borrowerId ? String(loanDetails.borrowerId) : ""
                  }
                  onValueChange={(value) =>
                    updateFields({ borrowerId: Number(value) })
                  }
                >
                  <SelectTrigger id="borrower" className="mt-2">
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {borrowersLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading customers...
                      </SelectItem>
                    ) : borrowersError ? (
                      <SelectItem value="error" disabled>
                        Failed to load customers {borrowersError}
                      </SelectItem>
                    ) : borrowers.length === 0 ? (
                      <SelectItem value="no-borrowers" disabled>
                        No customers found. Please add a customer first.
                      </SelectItem>
                    ) : (
                      borrowers.map((borrower) => (
                        <SelectItem
                          key={borrower.id}
                          value={String(borrower.id)}
                        >
                          {borrower.firstName} {borrower.lastName}
                          {borrower.email ? ` - ${borrower.email}` : ""}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="principal">Principal Amount (GHS)</Label>
                <Input
                  id="principal"
                  type="number"
                  min="1"
                  placeholder="25000"
                  value={loanDetails.principalAmount || ""}
                  onChange={(e) =>
                    updateFields({ principalAmount: Number(e.target.value) })
                  }
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="interest">Interest Rate (%)</Label>
                <Input
                  id="interest"
                  type="number"
                  min="0"
                
                  max="100"
                  step="0.25"
                  placeholder="20"
                  value={loanDetails.interestRate || ""}
                  onChange={(e) =>
                    updateFields({ interestRate: Number(e.target.value) })
                  }
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="term">Loan Term (weeks)</Label>
                <Select
                  value={loanDetails.durationWeeks.toString()}
                  onValueChange={(value) =>
                    updateFields({ durationWeeks: Number(value) })
                  }
                >
                  <SelectTrigger id="term" className="mt-2">
                    <SelectValue defaultValue={12} placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9">9 weeks</SelectItem>
                    <SelectItem value="10">10 weeks</SelectItem>
                    <SelectItem value="11">11 weeks</SelectItem>
                    <SelectItem value="12">12 weeks</SelectItem>
                    <SelectItem value="13">13 weeks</SelectItem>
                    <SelectItem value="14">14 weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="startDate">Repayment Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={loanDetails.startDate}
                  onChange={(e) => updateFields({ startDate: e.target.value })}
                  className="mt-2"
                  required
                />
              </div>
            </div>
          </div>

          {/* Loan Preview */}
          {loanDetails.principalAmount > 0 &&
            loanDetails.durationWeeks > 0 && (
              <div className="rounded-xl bg-primary/5 p-4 sm:p-6 ring-1 ring-primary/20">
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    Loan Preview
                  </h2>
                </div>
                <div className="mt-4 sm:mt-6 grid gap-4 grid-cols-1 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Weekly Payment
                    </p>
                    <p className="mt-1 font-display text-xl sm:text-2xl font-bold text-foreground">
                      {formatCurrency(weeklyPayment())}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Interest
                    </p>
                    <p className="mt-1 font-display text-xl sm:text-2xl font-bold text-foreground">
                      {formatCurrency(totalInterest())}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Payable
                    </p>
                    <p className="mt-1 font-display text-xl sm:text-2xl font-bold text-foreground">
                      {formatCurrency(totalPayable())}
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link to="/loans">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !loanDetails.borrowerId ||
                !loanDetails.principalAmount ||
                !loanDetails.durationWeeks ||
                !loanDetails.startDate
              }
            >
              {isLoading ? "Creating..." : "Create Loan"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
