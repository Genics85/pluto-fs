import { useState } from "react";
import {
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Building2,
} from "lucide-react";
import { Layout } from "../components/layout/Layout";
import { usePageTitle } from "../hooks/usePageTitle";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Label } from "../components/ui/label";
import { useGetFundingAccountsQuery } from "../services/accountApi";
import { useGetLoansQuery } from "../services/loansApi";
import { useGetTransactionsByAccountQuery, useCreateFundingTransactionMutation, type TransactionType } from "../services/transactionsApi";
import { useGetPrincipalsQuery } from "../services/principalsApi";
import { toast } from "sonner";

export default function Funds() {
  usePageTitle("Funds Management");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [transactionForm, setTransactionForm] = useState({
    accountId: 0,
    amount: 0,
    type: "DEPOSIT" as TransactionType,
    note: "",
    principalId: undefined as number | undefined,
  });

  const { data: accounts = [], isLoading: accountsLoading } = useGetFundingAccountsQuery();
  const { data: loans = [] } = useGetLoansQuery();
  const { data: principals = [] } = useGetPrincipalsQuery();
  const { data: transactions = [], isLoading: transactionsLoading } = useGetTransactionsByAccountQuery(
    selectedAccountId || (accounts[0]?.id ?? 0),
    { skip: !selectedAccountId && accounts.length === 0 }
  );
  const [createTransaction, { isLoading: isCreating }] = useCreateFundingTransactionMutation();

  // Set initial selected account when accounts load
  if (!selectedAccountId && accounts.length > 0) {
    setSelectedAccountId(accounts[0].id);
  }

  const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId);

  const formatCurrency = (amount: number, currency: string = "GHS") => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case "DEPOSIT":
        return <ArrowDownRight className="h-4 w-4 text-success" />;
      case "RELEASE":
        return <ArrowDownRight className="h-4 w-4 text-blue-500" />;
      case "WITHDRAWAL":
        return <ArrowUpRight className="h-4 w-4 text-purple-500" />;
      case "ALLOCATION":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case "ADJUSTMENT":
        return <ArrowUpRight className="h-4 w-4 text-amber-500" />;
      default:
        return <ArrowUpRight className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTransactionColor = (type: TransactionType) => {
    switch (type) {
      case "DEPOSIT":
        return "text-success";
      case "RELEASE":
        return "text-blue-500";
      case "WITHDRAWAL":
        return "text-purple-500";
      case "ALLOCATION":
        return "text-red-500";
      case "ADJUSTMENT":
        return "text-amber-500";
      default:
        return "text-foreground";
    }
  };

  const getTransactionBgColor = (type: TransactionType) => {
    switch (type) {
      case "DEPOSIT":
        return "bg-success/10";
      case "RELEASE":
        return "bg-blue-500/10";
      case "WITHDRAWAL":
        return "bg-purple-500/10";
      case "ALLOCATION":
        return "bg-red-500/10";
      case "ADJUSTMENT":
        return "bg-amber-500/10";
      default:
        return "bg-muted/10";
    }
  };

  const handleOpenTransactionDialog = () => {
    setTransactionForm({
      accountId: selectedAccountId || accounts[0]?.id || 0,
      amount: 0,
      type: "DEPOSIT",
      note: "",
      principalId: undefined,
    });
    setIsTransactionDialogOpen(true);
  };

  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transactionForm.accountId) {
      toast.error("Please select an account");
      return;
    }

    if (!transactionForm.amount || transactionForm.amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!transactionForm.note.trim()) {
      toast.error("Please enter a note");
      return;
    }

    try {
      await createTransaction(transactionForm).unwrap();
      toast.success("Transaction created successfully!");
      setIsTransactionDialogOpen(false);
    } catch (error) {
      toast.error("Failed to create transaction. Please try again.");
      console.error(error);
    }
  };

  const totalAvailable = accounts.reduce((sum, acc) => sum + acc.availableBalance, 0);
  const totalReserved = accounts.reduce((sum, acc) => sum + acc.reservedBalance, 0);
  const totalOutstanding = loans.reduce((sum, loan) => sum + (loan.outstandingBalance || 0), 0);
  const totalBalance = totalOutstanding + totalAvailable;
  const interestReceivable = totalOutstanding - totalReserved;

  const filteredAccounts = accounts.filter((account) =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="page-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title text-2xl sm:text-3xl">Funds Management</h1>
          <p className="page-description text-sm sm:text-base">
            Track and manage your funding accounts and transactions
          </p>
        </div>
        <Button onClick={handleOpenTransactionDialog} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          New Transaction
        </Button>
      </div>

      {/* Overview Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Balance
              </p>
              <p className="mt-2 text-2xl sm:text-3xl font-semibold text-foreground">
                {formatCurrency(totalBalance)}
              </p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-primary/10">
              <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Available
              </p>
              <p className="mt-2 text-2xl sm:text-3xl font-semibold text-success">
                {formatCurrency(totalAvailable)}
              </p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-success/10">
              <ArrowDownRight className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Principal In Arrears
              </p>
              <p className="mt-2 text-2xl sm:text-3xl font-semibold text-foreground">
                {formatCurrency(totalReserved)}
              </p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-muted/10">
              <ArrowUpRight className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Outstanding
              </p>
              <p className="mt-2 text-2xl sm:text-3xl font-semibold text-blue-500">
                {formatCurrency(totalOutstanding)}
              </p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-blue-500/10">
              <ArrowUpRight className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Interest Receivable
              </p>
              <p className="mt-2 text-2xl sm:text-3xl font-semibold text-amber-500">
                {formatCurrency(interestReceivable)}
              </p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-amber-500/10">
              <ArrowUpRight className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accounts List */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 className="text-lg font-semibold text-foreground">Funding Accounts</h3>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-4">
            {accountsLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading accounts...
              </div>
            ) : filteredAccounts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No accounts found
              </div>
            ) : (
              filteredAccounts.map((account) => (
                <div
                  key={account.id}
                  onClick={() => setSelectedAccountId(account.id)}
                  className={`bg-card rounded-xl border shadow-sm p-4 cursor-pointer transition-all ${
                    selectedAccountId === account.id
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border/50 hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{account.name}</h4>
                        <p className="text-sm text-muted-foreground">{account.currency}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {formatCurrency(account.totalBalance, account.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Available</p>
                      <p className="font-semibold text-success">
                        {formatCurrency(account.availableBalance, account.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Principal In Arrears</p>
                      <p className="font-semibold text-muted-foreground">
                        {formatCurrency(account.reservedBalance, account.currency)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Transactions */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {selectedAccount ? `${selectedAccount.name} - Transactions` : "Transactions"}
          </h3>
          <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
            {transactionsLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading transactions...
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found
              </div>
            ) : (
              <div className="divide-y divide-border/50 max-h-[600px] overflow-y-auto">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getTransactionBgColor(tx.type)}`}>
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{tx.type === "ALLOCATION" ? "DISBURSEMENT" : tx.type === "RELEASE" ? "REPAYMENT" : tx.type}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {tx.note}
                        </p>
                        {tx.principal && (
                          <p className="text-xs text-muted-foreground">
                            Investor: {tx.principal.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${getTransactionColor(tx.type)}`}>
                        {(tx.type === "DEPOSIT" || tx.type === "RELEASE" ? "+" : "-")}
                        {formatCurrency(tx.amount, "GHS")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(tx.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Transaction Dialog */}
      <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Transaction</DialogTitle>
            <DialogDescription>
              Add a new transaction to a funding account
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitTransaction} className="space-y-4">
            <div>
              <Label htmlFor="account">Account</Label>
              <Select
                value={String(transactionForm.accountId)}
                onValueChange={(value) =>
                  setTransactionForm({ ...transactionForm, accountId: Number(value) })
                }
              >
                <SelectTrigger id="account" className="mt-2">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={String(account.id)}>
                      {account.name} - {formatCurrency(account.totalBalance, account.currency)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Transaction Type</Label>
              <Select
                value={transactionForm.type}
                onValueChange={(value) =>
                  setTransactionForm({ ...transactionForm, type: value as TransactionType })
                }
              >
                <SelectTrigger id="type" className="mt-2">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEPOSIT">Deposit</SelectItem>
                  <SelectItem value="WITHDRAWAL">Withdrawal</SelectItem>
                  <SelectItem value="ALLOCATION">Allocation</SelectItem>
                  <SelectItem value="RELEASE">Release</SelectItem>
                  <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={transactionForm.amount || ""}
                onChange={(e) =>
                  setTransactionForm({
                    ...transactionForm,
                    amount: Number(e.target.value),
                  })
                }
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="principal">Principal (Optional)</Label>
              <Select
                value={transactionForm.principalId ? String(transactionForm.principalId) : "none"}
                onValueChange={(value) =>
                  setTransactionForm({
                    ...transactionForm,
                    principalId: value === "none" ? undefined : Number(value),
                  })
                }
              >
                <SelectTrigger id="principal" className="mt-2">
                  <SelectValue placeholder="Select principal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Principal</SelectItem>
                  {principals.map((principal) => (
                    <SelectItem key={principal.id} value={String(principal.id)}>
                      {principal.name} - {principal.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="note">Note</Label>
              <Input
                id="note"
                placeholder="Transaction note or description"
                value={transactionForm.note}
                onChange={(e) =>
                  setTransactionForm({ ...transactionForm, note: e.target.value })
                }
                className="mt-2"
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsTransactionDialogOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Transaction"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
