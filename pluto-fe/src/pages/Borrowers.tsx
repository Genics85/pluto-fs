import { useState, useRef, useEffect } from "react";
import { Search, Plus, MoreHorizontal, Pencil } from "lucide-react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
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

      {/* Borrowers Table */}
      <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Ghana Card</TableHead>
              <TableHead className="text-center">Loans</TableHead>
              <TableHead className="text-right">Total Borrowed</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBorrowers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  No customers found.
                </TableCell>
              </TableRow>
            ) : (
              filteredBorrowers.map((borrower) => (
                <TableRow key={borrower.id} className="cursor-pointer" onClick={() => navigate(`/borrowers/${borrower.id}`)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-primary">
                          {borrower.firstName?.[0] || ""}{borrower.lastName?.[0] || ""}
                        </span>
                      </div>
                      <span className="font-medium text-foreground">
                        {borrower.firstName} {borrower.lastName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{borrower.email || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{borrower.phone || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{borrower.location || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{borrower.ghanaCard || "—"}</TableCell>
                  <TableCell className="text-center">
                    <span className="font-semibold text-primary">
                      {Array.isArray(borrower.loans) ? borrower.loans.length : 0}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {Array.isArray(borrower.loans)
                      ? `GH₵${borrower.loans.reduce((sum, loan) => sum + loan.principalAmount, 0).toLocaleString()}`
                      : "GH₵0"}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <BorrowerMenu onEdit={() => openEdit(borrower)} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
}
