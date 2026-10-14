// Repayment score (0-100) from the backend; null means nothing is due yet.
export function scoreLabel(score: number) {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 50) return "Fair";
  return "Poor";
}

export function scoreClass(score: number | null) {
  if (score === null) return "bg-gray-100 text-gray-600";
  if (score >= 90) return "bg-green-100 text-green-800";
  if (score >= 75) return "bg-blue-100 text-blue-800";
  if (score >= 50) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
}

export function ScoreBadge({ score }: { score: number | null | undefined }) {
  const value = score ?? null;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${scoreClass(value)}`}
      title="Repayment score: on time or up to 3 days late = 100, 4–7 days = 75, 8–14 days = 50, later = 25, unpaid past grace = 0"
    >
      {value === null ? "New" : `${value} · ${scoreLabel(value)}`}
    </span>
  );
}
