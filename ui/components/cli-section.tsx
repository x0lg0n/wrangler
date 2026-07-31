import { ArrowRight, Layers, SquareTerminal, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

const commands = [
  {
    cmd: 'pnpm add @wrangler/protocol',
    desc: 'Install the Wrangler CLI via pnpm (or npm / yarn).',
  },
  {
    cmd: 'wrangler submit --credential "your-secret" --feedback "Safety concerns on floor 3"',
    desc: 'Submit ZK-verified feedback directly from your terminal.',
  },
  {
    cmd: 'wrangler status',
    desc: 'Check on-chain contract state and feedback count.',
  },
];

export default function CliSection() {
  return (
    <section id="cli" className="relative z-[1] mx-auto w-full max-w-[1280px] px-6 py-20 md:py-[100px]">
      <div className="mb-[60px] text-center">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-accent-border bg-accent-dim px-3.5 py-1.5 text-[11px] font-medium tracking-[0.5px] text-accent uppercase backdrop-blur">
          Developer Tooling
        </div>
        <h2 className="mb-3 text-[28px] font-bold tracking-[-1px] md:text-[40px]">Wrangler CLI</h2>
        <p className="mx-auto max-w-[560px] text-base leading-[1.7] text-muted-foreground">
          Submit and verify feedback without ever opening a browser. The Wrangler CLI is
          designed for automation, CI/CD pipelines, and power users.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-2">
        <div className="md:sticky md:top-[100px]">
          <div className="overflow-hidden rounded-2xl border border-border bg-[#0f172a]/80 shadow-[0_24px_48px_rgba(0,0,0,0.4)] backdrop-blur">
            <div className="flex items-center gap-2 border-b border-border bg-black/40 px-4 py-3">
              <span className="size-3 rounded-full bg-rose-500" />
              <span className="size-3 rounded-full bg-amber-500" />
              <span className="size-3 rounded-full bg-emerald-500" />
              <span className="ml-2 font-mono text-[11px] text-slate-400">wrangler-cli ~ bash</span>
            </div>
            <div className="p-6 font-mono text-[13px] leading-[1.8] text-slate-300">
              {commands.map((item, i) => (
                <div key={i}>
                  <div className="mb-1 flex gap-3">
                    <span className="shrink-0 text-emerald-400">$</span>
                    <span className="text-slate-200">{item.cmd}</span>
                  </div>
                  <div className="mb-4 flex gap-3 text-slate-400">
                    <span className="invisible">&gt;</span>
                    <span className="text-xs italic">{item.desc}</span>
                  </div>
                </div>
              ))}
              <div className="flex gap-3">
                <span className="shrink-0 text-emerald-400">$</span>
                <span className="inline-block h-4 w-2 animate-pulse bg-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-6 text-[22px] font-bold">Why use the CLI?</h3>
          <ul className="flex flex-col gap-5">
            {[
              { icon: <Layers className="size-5" />, title: 'Headless', text: 'Run from any server, CI pipeline, or automated workflow — no browser required.' },
              { icon: <SquareTerminal className="size-5" />, title: 'Batch Processing', text: 'Submit multiple feedbacks in a single session with automated credential hashing.' },
              { icon: <Zap className="size-5" />, title: 'Open Source', text: 'Auditable, forkable, and self-hostable. Published on npm for easy installation.' },
            ].map((benefit, i) => (
              <li key={i} className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-[10px] border border-border bg-bg text-accent">
                  {benefit.icon}
                </div>
                <div>
                  <strong className="mb-1 block text-sm font-semibold">{benefit.title}</strong>
                  <p className="text-[13px] leading-[1.6] text-muted-foreground">{benefit.text}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <Button asChild className="rounded-full px-6">
              <a href="https://github.com/x0lg0n/wrangler" target="_blank" rel="noopener noreferrer">
                <GithubIcon className="size-4" />
                View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
