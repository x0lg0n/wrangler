import { Shield } from 'lucide-react';
import DashboardClient from '@/components/dashboard-client';
import { getContractData, getFeedbacks } from '@/app/actions';

export default async function DashboardPage() {
  const { deployment, error, chainCount } = await getContractData();
  const feedbacks = await getFeedbacks();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-[100] border-b border-nav-border bg-nav-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-[1280px] items-center justify-between px-6">
          <a href="/" className="flex items-center gap-2.5 text-[15px] font-semibold">
            <Shield className="size-4.5 text-accent" />
            Wrangler
          </a>
          <nav className="flex items-center gap-6">
            <a href="/" className="text-[13px] font-medium text-secondary-foreground transition-colors hover:text-foreground">
              Home
            </a>
            <a
              href="https://github.com/x0lg0n/wrangler"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] font-medium text-secondary-foreground transition-colors hover:text-foreground"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>
      <DashboardClient
        deployment={deployment}
        error={error}
        initialFeedbacks={feedbacks}
        initialCount={feedbacks.length}
        chainCount={chainCount}
      />
    </div>
  );
}
