import { useState } from "react";
import { Layout } from "../components/layout/Layout";
import { usePageTitle } from "../hooks/usePageTitle";
import { useGetFundingAccountsQuery, useCreateFundingAccountMutation } from "../services/accountApi";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
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
import { Plus, Building2, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

export default function Accounts() {
  usePageTitle("Funding Accounts");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    currency: "GHS",
    initialDeposit: 0,
  });

  const { data: accounts = [], isLoading, isError } = useGetFundingAccountsQuery();
  const [createAccount, { isLoading: isCreating }] = useCreateFundingAccountMutation();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter an account name");
      return;
    }

    if (formData.initialDeposit < 0) {
      toast.error("Initial deposit cannot be negative");
      return;
    }

    try {
      await createAccount(formData).unwrap();
      toast.success("Account created successfully!");
      setIsDialogOpen(false);
      setFormData({
        name: "",
        currency: "GHS",
        initialDeposit: 0,
      });
    } catch (error) {
      toast.error("Failed to create account. Please try again.");
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      currency: "GHS",
      initialDeposit: 0,
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Funding Accounts
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage your funding accounts and track balances
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Account
          </Button>
        </div>

        {/* Accounts Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-muted-foreground">Loading accounts...</p>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-destructive">Failed to load accounts</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-xl border-2 border-dashed border-border bg-muted/50">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              No accounts yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Create your first funding account to get started
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Account
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="rounded-xl bg-card p-6 shadow-sm ring-1 ring-border hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-foreground">
                        {account.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {account.currency}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {/* Total Balance */}
                  <div>
                    <p className="text-sm text-muted-foreground">Total Balance</p>
                    <p className="mt-1 font-display text-2xl font-bold text-foreground">
                      {formatCurrency(account.totalBalance, account.currency)}
                    </p>
                  </div>

                  {/* Available & Reserved */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        Available
                      </div>
                      <p className="mt-1 font-semibold text-success">
                        {formatCurrency(account.availableBalance, account.currency)}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <TrendingDown className="h-3 w-3" />
                        Reserved
                      </div>
                      <p className="mt-1 font-semibold text-muted-foreground">
                        {formatCurrency(account.reservedBalance, account.currency)}
                      </p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Created: {formatDate(account.createdAt)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last updated: {formatDate(account.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Account Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Funding Account</DialogTitle>
              <DialogDescription>
                Add a new funding account to manage your finances
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Account Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., General Account, Emergency Fund"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, currency: value })
                  }
                >
                  <SelectTrigger id="currency" className="mt-2">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GHS">GHS - Ghanaian Cedi</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="initialDeposit">Initial Deposit</Label>
                <Input
                  id="initialDeposit"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.initialDeposit || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      initialDeposit: Number(e.target.value),
                    })
                  }
                  className="mt-2"
                  required
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Account"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
