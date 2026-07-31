import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export default function CtaSection() {
  return (
    <section className="relative z-[1] mx-auto w-full max-w-[1280px] px-6 py-20 md:py-[100px]">
      <div className="relative overflow-hidden rounded-2xl border border-accent-border bg-[linear-gradient(135deg,var(--accent-glow),var(--indigo-dim))] px-6 py-20 text-center md:px-10">
        <div className="pointer-events-none absolute top-[-50%] left-[-50%] h-[200%] w-[200%] bg-[radial-gradient(circle_at_30%_40%,var(--accent-glow)_0%,transparent_50%)]" />
        <h2 className="relative mb-3 text-[28px] font-bold tracking-[-1px] md:text-4xl">Ready to Speak Freely?</h2>
        <p className="relative mx-auto mb-8 max-w-[480px] leading-[1.7] text-muted-foreground">
          Connect your Midnight wallet and submit your first ZK-verified feedback in seconds.
          No identity, no tracking, just proof.
        </p>
        <div className="relative flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg" className="h-12 rounded-full px-8 text-[15px] font-semibold">
            <a href="/dashboard">
              Launch Dashboard
              <ArrowRight className="size-4" />
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 rounded-full bg-elevated px-8 text-[15px] text-secondary-foreground"
          >
            <a href="https://github.com/x0lg0n/wrangler" target="_blank" rel="noopener noreferrer">
              <GithubIcon className="size-4" />
              View on GitHub
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
