import { type Borrower,type Loan,type Payment,type LoanWithSchedule } from '../types/loan';

export const borrowers: Borrower[] = [
  {
    id: '1',
    name: 'John Anderson',
    email: 'john.anderson@email.com',
    phone: '+1 (555) 123-4567',
    address: '123 Oak Street, Springfield, IL 62701',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Sarah Mitchell',
    email: 'sarah.m@email.com',
    phone: '+1 (555) 234-5678',
    address: '456 Maple Avenue, Chicago, IL 60601',
    createdAt: new Date('2024-02-20'),
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'mchen@email.com',
    phone: '+1 (555) 345-6789',
    address: '789 Pine Road, Aurora, IL 60502',
    createdAt: new Date('2024-03-10'),
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    phone: '+1 (555) 456-7890',
    address: '321 Elm Street, Naperville, IL 60540',
    createdAt: new Date('2024-04-05'),
  },
];

function calculateMonthlyPayment(principal: number, annualRate: number, months: number): number {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / months;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
}

function generatePaymentSchedule(loan: Loan): Payment[] {
  const payments: Payment[] = [];
  const monthlyRate = loan.interestRate / 100 / 12;
  let balance = loan.principalAmount;
  
  for (let i = 0; i < loan.termMonths; i++) {
    const interest = balance * monthlyRate;
    const principal = loan.monthlyPayment - interest;
    balance = Math.max(0, balance - principal);
    
    const dueDate = new Date(loan.startDate);
    dueDate.setMonth(dueDate.getMonth() + i + 1);
    
    const today = new Date();
    let status: 'paid' | 'pending' | 'overdue' = 'pending';
    let paidDate: Date | undefined;
    
    if (i < 3) {
      status = 'paid';
      paidDate = new Date(dueDate);
      paidDate.setDate(paidDate.getDate() - Math.floor(Math.random() * 5));
    } else if (dueDate < today) {
      status = Math.random() > 0.3 ? 'paid' : 'overdue';
      if (status === 'paid') {
        paidDate = new Date(dueDate);
        paidDate.setDate(paidDate.getDate() + Math.floor(Math.random() * 3));
      }
    }
    
    payments.push({
      id: `${loan.id}-${i + 1}`,
      loanId: loan.id,
      dueDate,
      amount: Math.round(loan.monthlyPayment * 100) / 100,
      principal: Math.round(principal * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      balance: Math.round(balance * 100) / 100,
      status,
      paidDate,
    });
  }
  
  return payments;
}

export const loans: Loan[] = [
  {
    id: '1',
    borrowerId: '1',
    borrowerName: 'John Anderson',
    principalAmount: 25000,
    interestRate: 8.5,
    termMonths: 24,
    startDate: new Date('2024-06-01'),
    status: 'active',
    monthlyPayment: calculateMonthlyPayment(25000, 8.5, 24),
    totalInterest: calculateMonthlyPayment(25000, 8.5, 24) * 24 - 25000,
    totalAmount: calculateMonthlyPayment(25000, 8.5, 24) * 24,
  },
  {
    id: '2',
    borrowerId: '2',
    borrowerName: 'Sarah Mitchell',
    principalAmount: 15000,
    interestRate: 7.25,
    termMonths: 12,
    startDate: new Date('2024-08-15'),
    status: 'active',
    monthlyPayment: calculateMonthlyPayment(15000, 7.25, 12),
    totalInterest: calculateMonthlyPayment(15000, 7.25, 12) * 12 - 15000,
    totalAmount: calculateMonthlyPayment(15000, 7.25, 12) * 12,
  },
  {
    id: '3',
    borrowerId: '3',
    borrowerName: 'Michael Chen',
    principalAmount: 50000,
    interestRate: 9.0,
    termMonths: 36,
    startDate: new Date('2024-03-01'),
    status: 'active',
    monthlyPayment: calculateMonthlyPayment(50000, 9.0, 36),
    totalInterest: calculateMonthlyPayment(50000, 9.0, 36) * 36 - 50000,
    totalAmount: calculateMonthlyPayment(50000, 9.0, 36) * 36,
  },
  {
    id: '4',
    borrowerId: '4',
    borrowerName: 'Emily Davis',
    principalAmount: 10000,
    interestRate: 6.5,
    termMonths: 6,
    startDate: new Date('2024-07-01'),
    status: 'paid',
    monthlyPayment: calculateMonthlyPayment(10000, 6.5, 6),
    totalInterest: calculateMonthlyPayment(10000, 6.5, 6) * 6 - 10000,
    totalAmount: calculateMonthlyPayment(10000, 6.5, 6) * 6,
  },
];

export const loansWithSchedule: LoanWithSchedule[] = loans.map(loan => ({
  ...loan,
  payments: generatePaymentSchedule(loan),
  borrower: borrowers.find(b => b.id === loan.borrowerId)!,
}));

export function getLoanById(id: string): LoanWithSchedule | undefined {
  return loansWithSchedule.find(loan => loan.id === id);
}

export function getBorrowerById(id: string): Borrower | undefined {
  return borrowers.find(borrower => borrower.id === id);
}

export function getStats() {
  const totalLoans = loans.length;
  const activeLoans = loans.filter(l => l.status === 'active').length;
  const totalPrincipal = loans.reduce((sum, l) => sum + l.principalAmount, 0);
  const totalOutstanding = loansWithSchedule.reduce((sum, l) => {
    const unpaidPayments = l.payments.filter(p => p.status !== 'paid');
    return sum + unpaidPayments.reduce((s, p) => s + p.amount, 0);
  }, 0);
  const overduePayments = loansWithSchedule.reduce((sum, l) => {
    return sum + l.payments.filter(p => p.status === 'overdue').length;
  }, 0);
  const totalInterestEarned = loansWithSchedule.reduce((sum, l) => {
    const paidPayments = l.payments.filter(p => p.status === 'paid');
    return sum + paidPayments.reduce((s, p) => s + p.interest, 0);
  }, 0);
  
  return {
    totalLoans,
    activeLoans,
    totalPrincipal,
    totalOutstanding,
    overduePayments,
    totalInterestEarned,
  };
}
