import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, TrendingUp, Users, ShieldCheck } from "lucide-react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { loginWithGoogle } from "../hooks/useAuth";

const features = [
  { icon: TrendingUp, label: "Portfolio analytics at a glance" },
  { icon: Users, label: "Customer & borrower management" },
  { icon: CreditCard, label: "Loan lifecycle tracking" },
  { icon: ShieldCheck, label: "Repayment schedules & overdue alerts" },
];

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (cred: CredentialResponse) => {
    setError("");
    if (!cred.credential) {
      setError("No credential returned from Google. Please try again.");
      return;
    }

    setLoading(true);
    try {
      await loginWithGoogle(cred.credential);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
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
              Sign in with your Google account to continue
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google sign-in was cancelled or failed.")}
                useOneTap
                theme="outline"
                size="large"
                width="320"
              />
            </div>

            {loading && (
              <p className="text-sm text-muted-foreground text-center">Signing in…</p>
            )}

            {error && (
              <p className="text-sm text-destructive font-medium text-center">{error}</p>
            )}

            <p className="text-xs text-muted-foreground text-center">
              Access is limited to accounts registered by your administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
