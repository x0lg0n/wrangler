import { CheckCircle2, Lock, Database, ArrowDown } from 'lucide-react';

export default function ParadoxSection() {
  return (
    <section className="relative z-[1] border-y border-nav-border bg-section-bg py-20 md:py-[100px]">
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 items-center gap-10 px-6 md:grid-cols-2 md:gap-16">
        <div>
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-accent-border bg-accent-dim px-3.5 py-1.5 text-[11px] font-medium tracking-[0.5px] text-accent uppercase backdrop-blur">
            Solving the Problem
          </div>
          <h2 className="mb-5 text-[28px] font-bold tracking-[-1px] md:text-4xl">The Transparency Paradox</h2>
          <p className="mb-6 text-[15px] leading-[1.8] text-muted-foreground">
            Traditional organizations struggle to gather honest critical feedback.
            Centralized systems require blind trust in IT. Public blockchains sacrifice
            anonymity. Fully anonymous systems invite spam and Sybil attacks.
          </p>
          <ul className="flex flex-col gap-4">
            {[
              'Mathematically guarantees 100% verified participants.',
              'Absolute zero-knowledge anonymity for the submitter.',
              'Spam and double-submission prevention via cryptographic nullifiers.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm leading-[1.5]">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative rounded-2xl border border-border bg-elevated p-8 backdrop-blur">
          <div className="pointer-events-none absolute -inset-0.5 -z-10 rounded-[18px] bg-[radial-gradient(circle_at_30%_40%,var(--accent-glow),transparent_60%)]" />
          <div className="flex items-center gap-4 border-b border-border py-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-bg-card text-muted-foreground">
              <Lock className="size-5" />
            </div>
            <div>
              <h4 className="mb-0.5 text-sm font-semibold">Private Witness</h4>
              <p className="text-xs text-muted-foreground">Your Employee ID (Stays Local)</p>
            </div>
          </div>
          <div className="flex justify-center py-2 text-accent">
            <ArrowDown className="size-5" />
          </div>
          <div className="flex items-center gap-4 py-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-accent-border bg-accent-dim text-accent">
              <Database className="size-5" />
            </div>
            <div>
              <h4 className="mb-0.5 text-sm font-semibold text-accent">Public State</h4>
              <p className="text-xs text-muted-foreground">The Feedback Text (Public Ledger)</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
