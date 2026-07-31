import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-[1280px] min-h-[60dvh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full border border-accent-border bg-accent-dim font-mono text-lg font-bold text-accent">
        404
      </div>
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Page not found</h1>
      <p className="mb-6 max-w-md text-sm leading-relaxed text-muted-foreground">
        The page you are looking for does not exist or has been moved.
      </p>
      <Button asChild>
        <a href="/">Back to Home</a>
      </Button>
    </main>
  );
}
