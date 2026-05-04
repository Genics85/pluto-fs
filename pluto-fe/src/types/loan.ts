export interface Borrower {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  whatsapp: string
  ghanaCard: string
  location: string
  loans: Loan[]
  createdAt: string
  updatedAt: string
}

export interface AddBorrowerRequest {
  firstName: string
  lastName: string
  email: string
  phone: string
  whatsapp: string
  ghanaCard: string
  location: string
}

export interface UpdateBorrowerRequest {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  whatsapp: string
  ghanaCard: string
  location: string
}

export interface Loan {
  id: number
  principalAmount: number
  interestRate: number
  interestType: string
  durationWeeks: number
  startDate: string
  endDate: string
  totalPayable: number
  outstandingBalance: number
  status: "ACTIVE" | "PAID" | "DEFAULTED" | "CANCELLED"
  createdAt: string
  repayments: Repayment[]
  borrowerName: string
}

export interface Repayment {
  id: number
  amountPaid: number
  paymentDate: string
  repaymentStatus: "PENDING" | "PAID" | "OVERDUE"
  paymentMethod: "CASH" | "MOBILE_MONEY" | "BANK_TRANSFER" | "CHEQUE"
  createdAt: string
  updatedAt?: string
}

export interface LoanAddRequest {
  borrowerId: number
  principalAmount: number
  interestRate: number
  durationWeeks: number
  startDate: string
  totalPayable: number
}


export interface Payment {
  id: string;
  loanId: string;
  dueDate: Date;
  amount: number;
  principal: number;
  interest: number;
  balance: number;
  status: 'paid' | 'pending' | 'overdue';
  paidDate?: Date;
}

export interface LoanWithSchedule extends Loan {
  payments: Payment[];
  borrower: Borrower;
}
