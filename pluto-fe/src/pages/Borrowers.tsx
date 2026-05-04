import { useState, useRef, useEffect } from "react";
import { Search, Plus, MoreHorizontal, Mail, Phone, Pencil, MapPin, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { usePageTitle } from "../hooks/usePageTitle";
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
  DialogTrigger,
} from "../components/ui/dialog";
import { useGetBorrowersQuery, useAddBorrowerMutation, useUpdateBorrowerMutation } from "../services/borrowerApi";
import type { AddBorrowerRequest, Borrower } from "../types/loan";
import { toast } from "sonner";

const emptyForm: AddBorrowerRequest = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  whatsapp: "",
  ghanaCard: "",
  location: "",
};

function BorrowerMenu({ onEdit }: { onEdit: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        className="p-2 hover:bg-muted rounded-lg transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-10 min-w-[120px] bg-popover border border-border rounded-lg shadow-md py-1">
          <button
            className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors"
            onClick={() => { setOpen(false); onEdit(); }}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        </div>
      )}
    </div>
  );
}

export default function Borrowers() {
  usePageTitle("Customers");
  const [searchTerm, setSearchTerm] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Borrower | null>(null);
  const [formData, setFormData] = useState<AddBorrowerRequest>(emptyForm);
  const [editFormData, setEditFormData] = useState<AddBorrowerRequest>(emptyForm);

  const navigate = useNavigate();
  const { data: borrowers = [], isLoading, isError } = useGetBorrowersQuery();
  const [addBorrower, { isLoading: isAdding }] = useAddBorrowerMutation();
  const [updateBorrower, { isLoading: isUpdating }] = useUpdateBorrowerMutation();

  const filteredBorrowers = borrowers.filter((borrower) => {
    const fullName = `${borrower.firstName} ${borrower.lastName}`.toLowerCase();
    const email = borrower.email?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  const phoneFields = ["phone", "whatsapp"];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const sanitized = phoneFields.includes(name) ? value.replace(/\D/g, "").slice(0, 10) : value;
    setFormData((prev) => ({ ...prev, [name]: sanitized }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const sanitized = phoneFields.includes(name) ? value.replace(/\D/g, "").slice(0, 10) : value;
    setEditFormData((prev) => ({ ...prev, [name]: sanitized }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addBorrower(formData).unwrap();
      toast.success("Customer added successfully!");
      setAddOpen(false);
      setFormData(emptyForm);
    } catch {
      toast.error("Failed to add customer. Please try again.");
    }
  };

  const openEdit = (borrower: Borrower) => {
    setEditTarget(borrower);
    setEditFormData({
      firstName: borrower.firstName,
      lastName: borrower.lastName,
      email: borrower.email,
      phone: borrower.phone,
      whatsapp: borrower.whatsapp,
      ghanaCard: borrower.ghanaCard,
      location: borrower.location,
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    try {
      await updateBorrower({ id: editTarget.id, ...editFormData }).unwrap();
      toast.success("Customer updated successfully!");
      setEditOpen(false);
      setEditTarget(null);
    } catch {
      toast.error("Failed to update customer. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title">Customers</h1>
            <p className="page-description">
              Manage and view all customer information.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading customers...</p>
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title">Customers</h1>
            <p className="page-description">
              Manage and view all customer information.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-destructive">Error loading customers. Please try again.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title text-2xl sm:text-3xl">Customers</h1>
          <p className="page-description text-sm sm:text-base">
            Manage and view all customer information.
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                Fill in the customer's information below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    placeholder="Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="john.doe@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    maxLength={10}
                    placeholder="0XX XXX XXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp *</Label>
                  <Input
                    id="whatsapp"
                    name="whatsapp"
                    type="tel"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    required
                    maxLength={10}
                    placeholder="0XX XXX XXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ghanaCard">Ghana Card *</Label>
                  <Input
                    id="ghanaCard"
                    name="ghanaCard"
                    value={formData.ghanaCard}
                    onChange={handleInputChange}
                    required
                    placeholder="GHA-XXXXXXXXX-X"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    placeholder="City, Region"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isAdding}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {isAdding ? "Adding..." : "Add Customer"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update the customer's information below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName">First Name *</Label>
                <Input
                  id="edit-firstName"
                  name="firstName"
                  value={editFormData.firstName}
                  onChange={handleEditInputChange}
                  required
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Last Name *</Label>
                <Input
                  id="edit-lastName"
                  name="lastName"
                  value={editFormData.lastName}
                  onChange={handleEditInputChange}
                  required
                  placeholder="Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={editFormData.email}
                  onChange={handleEditInputChange}
                  required
                  placeholder="john.doe@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone *</Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  type="tel"
                  value={editFormData.phone}
                  onChange={handleEditInputChange}
                  required
                  maxLength={10}
                  placeholder="0XX XXX XXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-whatsapp">WhatsApp *</Label>
                <Input
                  id="edit-whatsapp"
                  name="whatsapp"
                  type="tel"
                  value={editFormData.whatsapp}
                  onChange={handleEditInputChange}
                  required
                  maxLength={10}
                  placeholder="0XX XXX XXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-ghanaCard">Ghana Card *</Label>
                <Input
                  id="edit-ghanaCard"
                  name="ghanaCard"
                  value={editFormData.ghanaCard}
                  onChange={handleEditInputChange}
                  required
                  placeholder="GHA-XXXXXXXXX-X"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="edit-location">Location *</Label>
                <Input
                  id="edit-location"
                  name="location"
                  value={editFormData.location}
                  onChange={handleEditInputChange}
                  required
                  placeholder="City, Region"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Borrowers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredBorrowers.map((borrower) => (
          <div
            key={borrower.id}
            className="bg-card rounded-xl border border-border/50 shadow-sm p-6 animate-fade-in hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary">
                    {borrower.firstName?.[0] || ""}
                    {borrower.lastName?.[0] || ""}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {borrower.firstName} {borrower.lastName}
                  </h3>
                  <span className="badge-active">
                    Active
                  </span>
                </div>
              </div>
              <BorrowerMenu onEdit={() => openEdit(borrower)} />
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                {borrower.email || "N/A"}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                {borrower.phone || "N/A"}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                {borrower.location || "N/A"}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4 shrink-0" />
                {borrower.ghanaCard || "N/A"}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div
                className="cursor-pointer hover:bg-muted/50 p-2 -m-2 rounded-lg transition-colors"
                onClick={() => navigate("/loans", { state: { borrowerName: `${borrower.firstName} ${borrower.lastName}` } })}
              >
                <p className="text-xs text-muted-foreground">Active Loans</p>
                <p className="font-semibold text-primary hover:text-primary/80 transition-colors">
                  {Array.isArray(borrower.loans) ? borrower.loans.length : 0}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total Borrowed</p>
                <p className="font-semibold text-foreground">
                  {Array.isArray(borrower.loans)
                    ? `GH₵${borrower.loans.reduce((sum, loan) => sum + loan.principalAmount, 0).toLocaleString()}`
                    : "GH₵0"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
