import { useState } from "react";
import { Layout } from "../components/layout/Layout";
import { usePageTitle } from "../hooks/usePageTitle";
import { useGetPrincipalsQuery, useCreatePrincipalMutation } from "../services/principalsApi";
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
import { Plus, UserCog, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

export default function Principals() {
  usePageTitle("Investors");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const { data: principals = [], isLoading, isError } = useGetPrincipalsQuery();
  const [createPrincipal, { isLoading: isCreating }] = useCreatePrincipalMutation();

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
      toast.error("Please enter a name");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Please enter an email");
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    try {
      await createPrincipal(formData).unwrap();
      toast.success("Investor created successfully!");
      setIsDialogOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
      });
    } catch (error) {
      toast.error("Failed to create investor. Please try again.");
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Investors
            </h1>
            <p className="mt-1 text-sm sm:text-base text-muted-foreground">
              Manage investors and their contact information
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Add Investor
          </Button>
        </div>

        {/* Principals Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-muted-foreground">Loading investors...</p>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-destructive">Failed to load investors</p>
          </div>
        ) : principals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-xl border-2 border-dashed border-border bg-muted/50">
            <UserCog className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              No investors yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Create your first investor to get started
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Investor
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {principals.map((principal) => (
              <div
                key={principal.id}
                className="rounded-xl bg-card p-6 shadow-sm ring-1 ring-border hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <UserCog className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-foreground">
                      {principal.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      ID: {principal.id}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {/* Email */}
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${principal.email}`}
                      className="text-sm text-foreground hover:text-primary transition-colors"
                    >
                      {principal.email}
                    </a>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`tel:${principal.phone}`}
                      className="text-sm text-foreground hover:text-primary transition-colors"
                    >
                      {principal.phone}
                    </a>
                  </div>

                  {/* Metadata */}
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Created: {formatDate(principal.createdAt)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last updated: {formatDate(principal.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Principal Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Investor</DialogTitle>
              <DialogDescription>
                Add a new investor to the system
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., John Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g., john.doe@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g., +233 123 456 789"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
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
                  {isCreating ? "Creating..." : "Create Investor"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
