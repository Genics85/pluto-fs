import { type Repayment } from '../../types/loan';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Button } from '../ui/button';
import { CheckCircle2 } from 'lucide-react';

interface RepaymentScheduleTableProps {
  repayments: Repayment[];
  onMarkAsPaid?: (repaymentId: number) => void;
}

export function PaymentScheduleTable({ repayments, onMarkAsPaid }: RepaymentScheduleTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  const getStatusBadge = (status: string) => {
    const statusClass =
      status === 'PAID' ? 'badge-success' :
      status === 'PENDING' ? 'badge-pending' :
      status === 'OVERDUE' ? 'badge-danger' :
      'badge-inactive';

    return (
      <span className={statusClass}>
        {status}
      </span>
    );
  };

  // Sort repayments by payment date (ascending - earliest first)
  const sortedRepayments = [...repayments].sort((a, b) => {
    return new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime();
  });

  return (
    <div className="rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold">#</TableHead>
            <TableHead className="font-semibold">Due Payment Date</TableHead>
            <TableHead className="font-semibold text-right">Amount Paid</TableHead>
            <TableHead className="font-semibold">Payment Method</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRepayments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No repayments found
              </TableCell>
            </TableRow>
          ) : (
            sortedRepayments.map((repayment, index) => (
              <TableRow key={repayment.id} className="animate-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>{formatDate(repayment.paymentDate)}</TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(repayment.amountPaid)}
                </TableCell>
                <TableCell>{repayment.paymentMethod.replace('_', ' ')}</TableCell>
                <TableCell>
                  {getStatusBadge(repayment.repaymentStatus)}
                </TableCell>
                <TableCell className="text-center">
                  {repayment.repaymentStatus === 'PAID' ? (
                    <span className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      Paid
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMarkAsPaid?.(repayment.id)}
                      className="gap-1"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Mark as Paid
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
