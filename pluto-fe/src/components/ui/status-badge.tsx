import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: 'ACTIVE' | 'PAID' | 'DEFAULTED' | 'CANCELLED' | 'paid' | 'pending' | 'overdue' | 'active' | 'defaulted';
  className?: string;
}

const statusStyles = {
  ACTIVE: 'status-active',
  PAID: 'status-paid',
  DEFAULTED: 'status-defaulted',
  CANCELLED: 'status-cancelled',
  paid: 'status-paid',
  pending: 'status-pending',
  overdue: 'status-overdue',
  active: 'status-active',
  defaulted: 'status-defaulted',
};

const statusLabels = {
  ACTIVE: 'Active',
  PAID: 'Paid',
  DEFAULTED: 'Defaulted',
  CANCELLED: 'Cancelled',
  paid: 'Paid',
  pending: 'Pending',
  overdue: 'Overdue',
  active: 'Active',
  defaulted: 'Defaulted',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
      statusStyles[status],
      className
    )}>
      {statusLabels[status]}
    </span>
  );
}
