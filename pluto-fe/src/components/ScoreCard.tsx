import { Gauge } from "lucide-react";
import type { Repayment } from "../types/loan";
import { describeHabit, paymentHabit } from "../lib/repayments";
import { scoreLabel } from "./ScoreBadge";

const tone = (score: number | null) => {
  if (score === null) return { text: "text-muted-foreground", bg: "bg-muted", bar: "bg-muted-foreground/40" };
  if (score >= 90) return { text: "text-green-600", bg: "bg-green-100", bar: "bg-green-500" };
  if (score >= 75) return { text: "text-blue-600", bg: "bg-blue-100", bar: "bg-blue-500" };
  if (score >= 50) return { text: "text-yellow-600", bg: "bg-yellow-100", bar: "bg-yellow-500" };
  return { text: "text-red-600", bg: "bg-red-100", bar: "bg-red-500" };
};

export function ScoreCard({
  score,
  repayments,
}: {
  score: number | null | undefined;
  repayments: Repayment[];
}) {
  const value = score ?? null;
  const habit = paymentHabit(repayments);
  const t = tone(value);

  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="flex items-center gap-4 shrink-0">
          <div className={`h-24 w-24 rounded-full ${t.bg} flex flex-col items-center justify-center`}>
            <span className={`text-4xl font-bold leading-none ${t.text}`}>
              {value === null ? "—" : value}
            </span>
            <span className="text-[10px] text-muted-foreground mt-1">/ 100</span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5" />
              Repayment Score
            </p>
            <p className={`text-2xl font-bold ${t.text}`}>
              {value === null ? "New" : scoreLabel(value)}
            </p>
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-3">
          <p className="text-base text-foreground">{describeHabit(habit)}</p>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div className={`h-full rounded-full ${t.bar}`} style={{ width: `${value ?? 0}%` }} />
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-medium bg-green-100 text-green-800">
              {habit.onTime} on time
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-800">
              {habit.late} late
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-medium bg-red-100 text-red-800">
              {habit.missed} overdue
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
