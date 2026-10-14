import { type Repayment } from '../../types/loan';
import { paidOn } from '../../lib/repayments';
import { ScoreBadge } from '../ScoreBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Button } from '../ui/button';
import { CheckCircle2, Undo2 } from 'lucide-react';

interface RepaymentScheduleTableProps {
  repayments: Repayment[];
  onMarkAsPaid?: (repaymentId: number) => void;
  // Only passed for admins; shows an Undo button on PAID rows.
  onUndo?: (repaymentId: number) => void;
}

export function PaymentScheduleTable({ repayments, onMarkAsPaid, onUndo }: RepaymentScheduleTableProps) {
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
            <TableHead className="font-semibold">Paid On</TableHead>
            <TableHead className="font-semibold text-right">Amount Paid</TableHead>
            <TableHead className="font-semibold">Payment Method</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold text-center">Score</TableHead>
            <TableHead className="font-semibold text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRepayments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No repayments found
              </TableCell>
            </TableRow>
          ) : (
            sortedRepayments.map((repayment, index) => (
              <TableRow key={repayment.id} className="animate-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>{formatDate(repayment.paymentDate)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {paidOn(repayment) ? formatDate(paidOn(repayment)!) : '—'}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(repayment.amountPaid)}
                </TableCell>
                <TableCell>{repayment.paymentMethod.replace('_', ' ')}</TableCell>
                <TableCell>
                  {getStatusBadge(repayment.repaymentStatus)}
                </TableCell>
                <TableCell className="text-center">
                  <ScoreBadge score={repayment.score} compact />
                </TableCell>
                <TableCell className="text-center">
                  {repayment.repaymentStatus === 'PAID' ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        Paid
                      </span>
                      {onUndo && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onUndo(repayment.id)}
                          className="gap-1 h-7 text-xs text-destructive hover:text-destructive"
                        >
                          <Undo2 className="h-3.5 w-3.5" />
                          Undo
                        </Button>
                      )}
                    </div>
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
