import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tool-tip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/index";
import Loans from "./pages/Loans";
import LoanDetails from "./pages/LoanDetails";
import NewLoan from "./pages/NewLoans";
import Borrowers from "./pages/Borrowers";
import BorrowerDetail from "./pages/BorrowerDetail";
import Accounts from "./pages/Accounts";
import Principals from "./pages/Principals";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Funds from "./pages/Funds";
import Login from "./pages/Login";
import { isAuthenticated } from "./hooks/useAuth";

const queryClient = new QueryClient();

function PrivateRoute({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Index /></PrivateRoute>} />
          <Route path="/loans" element={<PrivateRoute><Loans /></PrivateRoute>} />
          <Route path="/loans/new" element={<PrivateRoute><NewLoan /></PrivateRoute>} />
          <Route path="/loans/:id" element={<PrivateRoute><LoanDetails /></PrivateRoute>} />
          <Route path="/borrowers" element={<PrivateRoute><Borrowers /></PrivateRoute>} />
          <Route path="/borrowers/:id" element={<PrivateRoute><BorrowerDetail /></PrivateRoute>} />
          <Route path="/accounts" element={<PrivateRoute><Accounts /></PrivateRoute>} />
          <Route path="/principals" element={<PrivateRoute><Principals /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="/funds" element={<PrivateRoute><Funds /></PrivateRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
