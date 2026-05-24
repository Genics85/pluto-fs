import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, TrendingUp, Users, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { login } from "../hooks/useAuth";

const features = [
  { icon: TrendingUp, label: "Portfolio analytics at a glance" },
  { icon: Users, label: "Customer & borrower management" },
  { icon: CreditCard, label: "Loan lifecycle tracking" },
  { icon: ShieldCheck, label: "Repayment schedules & overdue alerts" },
];

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 400));

    const ok = login(username.trim(), password);
    setLoading(false);

    if (ok) {
      navigate("/", { replace: true });
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ background: "hsl(222, 47%, 11%)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: "hsl(221, 83%, 53%)" }}
          >
            <CreditCard className="h-5 w-5 text-white" />
          </div>
          <span
            className="text-xl font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            LoanTrack
          </span>
        </div>

        {/* Headline */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1
              className="text-4xl font-bold leading-tight"
              style={{
                fontFamily: "var(--font-display)",
                background: "linear-gradient(135deg, #fff 0%, hsl(221,83%,75%) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Manage your loan portfolio with confidence
            </h1>
            <p style={{ color: "hsl(215, 20%, 65%)" }} className="text-base leading-relaxed">
              Track disbursements, monitor repayments, and stay on top of your
              lending operations — all in one place.
            </p>
          </div>

          <ul className="space-y-4">
            {features.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ background: "hsl(221, 83%, 53%, 0.15)" }}
                >
                  <Icon className="h-4 w-4" style={{ color: "hsl(221, 83%, 70%)" }} />
                </div>
                <span className="text-sm" style={{ color: "hsl(215, 20%, 75%)" }}>
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="text-xs" style={{ color: "hsl(215, 16%, 40%)" }}>
          &copy; {new Date().getFullYear()} LoanTrack. All rights reserved.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-background">
        {/* Mobile logo */}
        <div className="flex items-center gap-3 mb-10 lg:hidden">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: "hsl(221, 83%, 53%)" }}
          >
            <CreditCard className="h-4 w-4 text-white" />
          </div>
          <span
            className="text-lg font-bold text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            LoanTrack
          </span>
        </div>

        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-1">
            <h2
              className="text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive font-medium">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
