import { ArrowRight, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LaunchDashboardButton from './launch-dashboard-button';

export default function Hero() {
  return (
    <section className="relative z-[1] flex min-h-screen flex-col items-center justify-center px-6 pt-[120px] pb-20 text-center">
      <div className="mb-8 inline-flex items-center gap-1.5 rounded-full border border-accent-border bg-accent-dim px-3.5 py-1.5 text-xs font-medium text-accent backdrop-blur">
        <Layers className="size-3.5" />
        Powered by Midnight Network &middot; Zero-Knowledge
      </div>

      <h1 className="mb-6 max-w-[800px] text-[38px] font-extrabold leading-[1.05] tracking-[-1.5px] md:text-[64px] md:tracking-[-2px]">
        <span className="bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">
          Speak Freely.
        </span>
        <br />
        <span className="text-accent">Proven Privately.</span>
      </h1>

      <p className="mb-10 max-w-[600px] text-lg leading-[1.7] text-muted-foreground">
        The enterprise-grade anonymous feedback protocol. Submit mathematically verifiable feedback
        without ever revealing your identity to the public ledger.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <LaunchDashboardButton size="lg" className="h-12 rounded-full px-7 text-[15px] font-semibold">
          Launch Dashboard
          <ArrowRight className="size-4" />
        </LaunchDashboardButton>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="h-12 rounded-full px-7 text-[15px] text-secondary-foreground bg-elevated"
        >
          <a href="https://midnight.network" target="_blank" rel="noopener noreferrer">
            Read the Docs
          </a>
        </Button>
      </div>

      <div className="mt-20 w-full max-w-[700px] text-left">
        <div className="overflow-hidden rounded-2xl border border-border bg-[#0f172a]/80 shadow-[0_24px_48px_rgba(0,0,0,0.4)] backdrop-blur">
          <div className="flex items-center gap-2 border-b border-border bg-black/40 px-4 py-3">
            <span className="size-3 rounded-full bg-rose-500" />
            <span className="size-3 rounded-full bg-amber-500" />
            <span className="size-3 rounded-full bg-emerald-500" />
            <span className="ml-2 font-mono text-[11px] text-slate-400">midnight-zk-verify ~ bash</span>
          </div>
          <div className="p-5 font-mono text-[13px] leading-[1.8] text-slate-300">
            <div className="flex gap-3">
              <span className="shrink-0 text-emerald-400">$</span>
              <span>submitFeedback --credential 0x99.. --feedback &ldquo;Safety concerns on floor 3...&rdquo;</span>
            </div>
            <div className="flex gap-3">
              <span className="shrink-0 text-slate-500">&gt;</span>
              <span className="text-emerald-400">Generating local ZK proof... Verified.</span>
            </div>
            <div className="mb-4 flex gap-3">
              <span className="shrink-0 text-slate-500">&gt;</span>
              <span>
                Disclosing to ledger. Tx:&nbsp;
                <span className="text-blue-400 underline decoration-blue-400/30 underline-offset-[3px]">0x8f6a...14757</span>
              </span>
            </div>
            <div className="flex gap-3">
              <span className="shrink-0 text-emerald-400">$</span>
              <span className="inline-block h-4 w-2 animate-pulse bg-emerald-400" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
