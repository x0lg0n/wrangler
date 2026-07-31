'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet } from 'lucide-react';
import WalletModal from './wallet-modal';
import { ThemeToggle } from './theme-toggle';
import { Button } from '@/components/ui/button';

export default function Nav() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [walletAddr, setWalletAddr] = useState<string | null>(null);

  useEffect(() => {
    const addr = sessionStorage.getItem('wallet_address');
    if (addr) setWalletAddr(addr);
  }, []);

  const handleConnect = () => {
    if (walletAddr) return;
    setShowModal(true);
  };

  const handleDisconnect = () => {
    if (!window.confirm('Disconnect wallet? You will need to re-authenticate to submit feedback.')) return;
    sessionStorage.removeItem('wallet_address');
    setWalletAddr(null);
    if (window.location.pathname.startsWith('/dashboard')) {
      window.location.href = '/';
    }
  };

  const handleConnected = ({ walletAddress }: { walletAddress: string }) => {
    setWalletAddr(walletAddress);
    setShowModal(false);
    router.push('/dashboard');
  };

  return (
    <>
      <nav className="sticky top-0 z-[100] border-b border-nav-border bg-nav-bg backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between gap-4 px-6 max-md:h-auto max-md:flex-wrap max-md:py-2.5">
          <a href="/" className="flex items-center gap-2.5 text-lg font-bold tracking-[-0.3px] text-foreground" style={{ textDecoration: 'none' }}>
            <svg className="size-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Wrangler
          </a>
          <div className="flex items-center gap-3 max-md:flex-wrap max-md:justify-end">
            <a href="/" className="rounded-lg px-3.5 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-hover-bg hover:text-foreground">Home</a>
            <a href="/dashboard" className="rounded-lg px-3.5 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-hover-bg hover:text-foreground">Dashboard</a>
            <a href="https://github.com/x0lg0n/wrangler" target="_blank" rel="noopener noreferrer" className="rounded-lg px-3.5 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-hover-bg hover:text-foreground max-md:hidden">GitHub</a>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-card px-3 py-1 text-xs font-medium text-secondary-foreground max-md:hidden">
              <span className="inline-block size-1.5 rounded-full bg-accent shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]" />
              Preprod
            </span>
            <ThemeToggle />
            {walletAddr ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-card px-3.5 py-1.5 text-xs font-medium text-secondary-foreground backdrop-blur">
                  <span className="inline-block size-1.5 rounded-full bg-green shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                  {walletAddr.slice(0, 8)}...
                </span>
                <Button variant="ghost" size="sm" onClick={handleDisconnect} className="text-muted-foreground">
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button onClick={handleConnect} size="sm" className="h-10 rounded-full px-5 text-[13px] font-semibold">
                <Wallet className="size-4" />
                Launch Dashboard
              </Button>
            )}
          </div>
        </div>
      </nav>
      {showModal && (
        <WalletModal
          onClose={() => setShowModal(false)}
          onConnected={handleConnected}
        />
      )}
    </>
  );
}
