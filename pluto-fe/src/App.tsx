import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tool-tip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/index";
import Loans from "./pages/Loans";
import LoanDetails from "./pages/LoanDetails";
import NewLoan from "./pages/NewLoans";
import Borrowers from "./pages/Borrowers";
import Accounts from "./pages/Accounts";
import Principals from "./pages/Principals";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Funds from "./pages/Funds";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/loans/new" element={<NewLoan />} />
          <Route path="/loans/:id" element={<LoanDetails />} />
          <Route path="/borrowers" element={<Borrowers />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/principals" element={<Principals />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/funds" element={<Funds />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
