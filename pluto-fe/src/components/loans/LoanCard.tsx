import { Link } from 'react-router-dom';
import { type Loan } from '../../types/loan';
import { StatusBadge } from '../ui/status-badge';
import { ArrowRight, Calendar, Percent } from 'lucide-react';

interface LoanCardProps {
  loan: Loan;
}

export function LoanCard({ loan }: LoanCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  return (
    <Link
      to={`/loans/${loan.id}`}
      className="group block animate-fade-in rounded-xl bg-card p-6 shadow-sm ring-1 ring-border transition-all duration-300 hover:shadow-lg hover:ring-primary/20"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary">
            {loan.borrowerName}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Loan #{loan.id}
          </p>
        </div>
        <StatusBadge status={loan.status} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Principal</p>
          <p className="mt-1 font-display text-xl font-bold text-foreground">
            {formatCurrency(loan.principalAmount)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Monthly Payment</p>
          <p className="mt-1 font-display text-xl font-bold text-foreground">
            {formatCurrency(loan.monthlyPayment)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Percent className="h-4 w-4" />
          {loan.interestRate}% APR
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          {loan.termMonths} months
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm text-muted-foreground">
          Started {formatDate(loan.startDate)}
        </span>
        <span className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          View Details
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
