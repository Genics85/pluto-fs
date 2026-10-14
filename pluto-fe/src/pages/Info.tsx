import { Layout } from "../components/layout/Layout";
import { usePageTitle } from "../hooks/usePageTitle";
import { ScoreBadge } from "../components/ScoreBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

// Mirrors util/RepaymentScore.java in pluto-be; keep the two in sync.
const repaymentPoints = [
  { situation: "Paid on time, early, or up to 3 days late", points: 100 },
  { situation: "Paid 4 – 7 days late", points: 75 },
  { situation: "Paid 8 – 14 days late", points: 50 },
  { situation: "Paid more than 14 days late", points: 25 },
  { situation: "Unpaid and more than 3 days past the due date (until it's paid)", points: 0 },
  { situation: "Not due yet, or unpaid but still within the 3-day grace period", points: null },
];

const labels = [
  { range: "90 – 100", score: 95 },
  { range: "75 – 89", score: 80 },
  { range: "50 – 74", score: 60 },
  { range: "0 – 49", score: 30 },
  { range: "Nothing scored yet", score: null },
];

// Loan 2 from the live data at the time of writing, as a worked example.
const example = [
  { due: "May 9", paid: "May 9", points: 100 },
  { due: "May 16", paid: "May 10 (early)", points: 100 },
  { due: "May 30", paid: "Unpaid", points: 0 },
  { due: "Jun 27", paid: "Jun 29 (2 days late)", points: 100 },
  { due: "Jul 25", paid: "Jul 31 (6 days late)", points: 75 },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6 animate-fade-in">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <div className="space-y-4 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

export default function Info() {
  usePageTitle("Info");

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Info</h1>
        <p className="page-description">How the numbers in Pluto are worked out.</p>
      </div>

      <div className="max-w-3xl space-y-8">
        <Section title="Repayment score">
          <p>
            Every repayment, loan and customer gets a score from <strong className="text-foreground">0 to 100</strong>{" "}
            that shows how reliably repayments come in. It is recalculated every time the data is loaded, so it
            always reflects today's date and the latest payments.
          </p>
          <p>
            A repayment's lateness is the number of days between its <strong className="text-foreground">due date</strong>{" "}
            and the day it was <strong className="text-foreground">marked as paid</strong> in Pluto (the "Paid On"
            date). Registering a payment late therefore counts as paying late.
          </p>
        </Section>

        <Section title="Points for each repayment">
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Situation</TableHead>
                  <TableHead className="text-center w-24">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repaymentPoints.map((row) => (
                  <TableRow key={row.situation}>
                    <TableCell className="text-foreground">{row.situation}</TableCell>
                    <TableCell className="text-center">
                      <ScoreBadge score={row.points} compact />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              There is a <strong className="text-foreground">3-day grace period</strong>: paying up to 3 days after the
              due date still earns full points, and an unpaid repayment isn't counted against anyone until the grace
              period is over.
            </li>
            <li>
              The <strong className="text-foreground">0 for an unpaid repayment is temporary</strong>. Once it's
              marked as paid, it's re-scored by how late it was. For example, a repayment paid 10 days late moves
              from 0 to 50, and one paid 20 days late moves to 25. The loan and customer scores go up with it.
            </li>
            <li>
              Repayments shown as <ScoreBadge score={null} compact /> are left out of every average until they are paid
              or the grace period runs out.
            </li>
            <li>
              Undoing a payment puts the repayment back to unpaid, so its points are worked out again from scratch.
            </li>
          </ul>
        </Section>

        <Section title="Loan, customer and dashboard scores">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-foreground">Loan score</strong> – the average points of all the loan's scored
              repayments, rounded to a whole number.
            </li>
            <li>
              <strong className="text-foreground">Customer score</strong> – the average points of every scored
              repayment across all of the customer's loans together. Longer loans have more repayments, so they
              weigh more than short ones. Unpaid repayments on defaulted loans count as 0.
            </li>
            <li>
              <strong className="text-foreground">Avg Repayment Score</strong> (dashboard) – the average of the loan
              scores of all <em>active</em> loans that have a score.
            </li>
          </ul>
          <p>
            The customer page also describes the customer's habit, such as "Usually pays about a week late". This is
            based on their <em>typical</em> lateness (the middle value across all their paid repayments), plus how many
            repayments are overdue and still unpaid.
          </p>
        </Section>

        <Section title="Score labels">
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Score</TableHead>
                  <TableHead>Shown as</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labels.map((row) => (
                  <TableRow key={row.range}>
                    <TableCell className="text-foreground">{row.range}</TableCell>
                    <TableCell>
                      <ScoreBadge score={row.score} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Section>

        <Section title="Worked example">
          <p>Five of a loan's twelve repayments:</p>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Due</TableHead>
                  <TableHead>Paid On</TableHead>
                  <TableHead className="text-center w-24">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {example.map((row) => (
                  <TableRow key={row.due}>
                    <TableCell className="text-foreground">{row.due}</TableCell>
                    <TableCell>{row.paid}</TableCell>
                    <TableCell className="text-center">
                      <ScoreBadge score={row.points} compact />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p>
            Across all twelve, five were paid (four earning 100 and one 75) and seven are overdue and unpaid (0 each):{" "}
            <strong className="text-foreground">(4 × 100 + 75 + 7 × 0) ÷ 12 = 39.6</strong>, so the loan scores{" "}
            <ScoreBadge score={40} />.
          </p>
        </Section>
      </div>
    </Layout>
  );
}
