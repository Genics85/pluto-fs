import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { usePageTitle } from '../hooks/usePageTitle';
import { useGetLoanByIdQuery, useUpdateLoanStatusMutation, type LoanStatus } from '../services/loansApi';
import { useGetRepaymentsByLoanQuery, useUpdateRepaymentStatusMutation } from '../services/repaymentsApi';
import { PaymentScheduleTable } from '../components/loans/PaymentScheduleTable';
import { MarkRepaymentPaidDialog } from '../components/loans/MarkRepaymentPaidDialog';
import { StatusBadge } from '../components/ui/status-badge';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { type Repayment } from '../types/loan';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Percent,
  DollarSign,
  TrendingUp
} from 'lucide-react';

export default function LoanDetails() {
  const { id } = useParams<{ id: string }>();
  usePageTitle(`Loan #${id}`);
  const [selectedRepayment, setSelectedRepayment] = useState<Repayment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: loanData, isLoading, isError } = useGetLoanByIdQuery(id || '', {
    skip: !id,
  });
  const { data: repayments = [], isLoading: isLoadingRepayments } = useGetRepaymentsByLoanQuery(id || '', {
    skip: !id,
  });
  const [updateRepaymentStatus, { isLoading: isUpdating }] = useUpdateRepaymentStatusMutation();
  const [updateLoanStatus, { isLoading: isUpdatingStatus }] = useUpdateLoanStatusMutation();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-muted-foreground">Loading loan details...</p>
        </div>
      </Layout>
    );
  }

  if (isError || !loanData) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-16">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Loan not found
          </h1>
          <Link to="/loans" className="mt-4">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Loans
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  const paidRepayments = repayments.filter(r => r.repaymentStatus === 'PAID').length;
  const progressPercentage = repayments.length > 0 ? (paidRepayments / repayments.length) * 100 : 0;

  // Calculate actual amount paid from repayments with PAID status
  const actualAmountPaid = repayments
    .filter(r => r.repaymentStatus === 'PAID')
    .reduce((sum, r) => sum + (r.amountPaid || 0), 0);
  const outstandingBalance = loanData.totalPayable - actualAmountPaid;

  const handleMarkAsPaid = (repaymentId: number) => {
    const repayment = repayments.find(r => r.id === repaymentId);
    if (repayment) {
      setSelectedRepayment(repayment);
      setIsDialogOpen(true);
    }
  };

  const handleConfirmMarkAsPaid = async () => {
    if (!selectedRepayment) return;

    try {
      await updateRepaymentStatus({
        id: selectedRepayment.id,
        status: { repaymentStatus: 'PAID' },
      }).unwrap();

      toast.success('Repayment marked as paid successfully!');
      setIsDialogOpen(false);
      setSelectedRepayment(null);
    } catch (error) {
      toast.error('Failed to mark repayment as paid. Please try again.');
      console.error('Error marking repayment as paid:', error);
    }
  };

  const handleStatusChange = async (newStatus: LoanStatus) => {
    if (!loanData || newStatus === loanData.status) return;

    try {
      await updateLoanStatus({
        id: loanData.id,
        status: { status: newStatus },
      }).unwrap();
      toast.success(`Loan status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update loan status. Please try again.');
      console.error('Error updating loan status:', error);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Back Button */}
        <Link to="/loans">
          <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Back to Loans
          </Button>
        </Link>

        {/* Loan Header */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                Loan #{loanData.id}
              </h1>
              <StatusBadge status={loanData.status} />
            </div>
            <p className="mt-1 text-sm sm:text-base text-muted-foreground">
              Started on {formatDate(loanData.startDate)}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <Label htmlFor="status-select" className="text-sm text-muted-foreground">
              Update Status:
            </Label>
            <Select
              value={loanData.status}
              onValueChange={(value) => handleStatusChange(value as LoanStatus)}
              disabled={isUpdatingStatus}
            >
              <SelectTrigger id="status-select" className="w-full sm:w-[160px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="DEFAULTED">Defaulted</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Loan Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-card p-3 sm:p-4 shadow-sm ring-1 ring-border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">Principal</span>
                </div>
                <p className="mt-2 font-display text-lg sm:text-2xl font-bold text-foreground">
                  {formatCurrency(loanData.principalAmount)}
                </p>
              </div>
              <div className="rounded-xl bg-card p-3 sm:p-4 shadow-sm ring-1 ring-border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Percent className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">Interest Rate</span>
                </div>
                <p className="mt-2 font-display text-lg sm:text-2xl font-bold text-foreground">
                  {loanData.interestRate}%
                </p>
              </div>
              <div className="rounded-xl bg-card p-3 sm:p-4 shadow-sm ring-1 ring-border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">Term</span>
                </div>
                <p className="mt-2 font-display text-lg sm:text-2xl font-bold text-foreground">
                  {loanData.durationWeeks} weeks
                </p>
              </div>
              <div className="rounded-xl bg-card p-3 sm:p-4 shadow-sm ring-1 ring-border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">Total Payable</span>
                </div>
                <p className="mt-2 font-display text-lg sm:text-2xl font-bold text-foreground">
                  {formatCurrency(loanData.totalPayable)}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="rounded-xl bg-card p-4 sm:p-6 shadow-sm ring-1 ring-border">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="font-display font-semibold text-foreground">
                  Repayment Progress
                </h3>
                <span className="text-sm font-medium text-muted-foreground">
                  {paidRepayments} of {repayments.length} repayments
                </span>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-success transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="mt-4 flex flex-col sm:flex-row sm:justify-between gap-2 text-sm">
                <span className="text-muted-foreground">
                  Outstanding: {formatCurrency(outstandingBalance)}
                </span>
                <span className="font-medium text-foreground">
                  Total: {formatCurrency(loanData.totalPayable)}
                </span>
              </div>
            </div>

            {/* Repayment Schedule */}
            <div>
              <h3 className="mb-4 font-display text-xl font-semibold text-foreground">
                Repayment Schedule
              </h3>
              {isLoadingRepayments ? (
                <div className="rounded-xl border border-border bg-card p-8 text-center">
                  <p className="text-muted-foreground">Loading repayments...</p>
                </div>
              ) : (
                <PaymentScheduleTable
                  repayments={repayments}
                  onMarkAsPaid={handleMarkAsPaid}
                />
              )}
            </div>
          </div>

          {/* Borrower Info Sidebar */}
          <div className="space-y-6">
            <div className="rounded-xl bg-card p-6 shadow-sm ring-1 ring-border">
              <h3 className="font-display text-lg font-semibold text-foreground">
                Borrower Information
              </h3>
              {loanData.borrower ? (
                <>
                  <div className="mt-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <User className="mt-0.5 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium text-foreground">
                          {loanData.borrower.firstName} {loanData.borrower.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium text-foreground">
                          {loanData.borrower.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="mt-0.5 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium text-foreground">
                          {loanData.borrower.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium text-foreground">
                          {loanData.borrower.location}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Link to={`/borrowers/${loanData.borrower.id}`} className="mt-6 block">
                    <Button variant="outline" className="w-full">
                      View Borrower Profile
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="mt-6">
                  <p className="text-sm text-muted-foreground">
                    Borrower: {loanData.borrowerName || 'Unknown'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mark Repayment as Paid Dialog */}
        <MarkRepaymentPaidDialog
          repayment={selectedRepayment}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onConfirm={handleConfirmMarkAsPaid}
          isLoading={isUpdating}
        />
      </div>
    </Layout>
  );
}
