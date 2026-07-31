'use client';

import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-[1280px] min-h-[60dvh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full border border-red/30 bg-red-bg text-red">
        <XCircle className="size-5" />
      </div>
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Something went wrong</h1>
      <p className="mb-6 max-w-md text-sm leading-relaxed text-muted-foreground">
        An unexpected error occurred while loading this page. Try again — if the problem
        persists, check the contract service status.
      </p>
      <Button onClick={reset}>Try again</Button>
      <p className="mt-4 font-mono text-[11px] text-muted-foreground/70">{error.digest || error.message}</p>
    </main>
  );
}
