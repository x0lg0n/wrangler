import { Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative z-[1] border-t border-nav-border bg-bg py-10">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2">
          <Shield className="size-4" />
          <span>Wrangler &middot; Built on Midnight</span>
        </div>
        <div className="flex gap-6">
          <a href="https://midnight.network" target="_blank" rel="noopener noreferrer" className="text-[13px] transition-colors hover:text-secondary-foreground">Documentation</a>
          <a href="https://github.com/x0lg0n/wrangler" target="_blank" rel="noopener noreferrer" className="text-[13px] transition-colors hover:text-secondary-foreground">GitHub</a>
          <a href="/dashboard" className="text-[13px] transition-colors hover:text-secondary-foreground">Dashboard</a>
        </div>
      </div>
    </footer>
  );
}
