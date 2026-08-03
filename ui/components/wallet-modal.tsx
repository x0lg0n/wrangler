'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowRight, CheckCircle2, Loader2, RefreshCw, Wallet, XCircle, X } from 'lucide-react';
import { detectWallets, connectWallet, type WalletInfo, type WalletState } from '@/lib/wallet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  onClose: () => void;
  onConnected: (state: { walletAddress: string }) => void;
}

type Step = 'detecting' | 'select' | 'connecting' | 'success' | 'error';

export default function WalletModal({ onClose, onConnected }: Props) {
  const [step, setStep] = useState<Step>('detecting');
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null);
  const [walletState, setWalletState] = useState<WalletState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const detected = detectWallets();
    setWallets(detected);
    setStep(detected.length > 0 ? 'select' : 'error');
    if (detected.length === 0) {
      setError('No Midnight wallet detected. Install Lace or 1AM wallet.');
    }
  }, []);

  const refresh = useCallback(() => {
    setError(null);
    setStep('detecting');
    setTimeout(() => {
      const detected = detectWallets();
      setWallets(detected);
      setStep(detected.length > 0 ? 'select' : 'error');
      if (detected.length === 0) {
        setError('No Midnight wallet detected. Install Lace or 1AM wallet.');
      }
    }, 300);
  }, []);

  const handleConnect = useCallback(async (wallet: WalletInfo) => {
    setSelectedWallet(wallet);
    setStep('connecting');
    setLoading(true);
    setError(null);
    try {
      const { state } = await connectWallet(wallet.id, 'preview');
      setWalletState(state);
      window.sessionStorage.setItem('wallet_address', state.address);
      setStep('success');
      setTimeout(() => onConnected({ walletAddress: state.address }), 800);
    } catch (e: any) {
      setError(e.message || 'Failed to connect wallet');
      setStep('error');
    } finally {
      setLoading(false);
    }
  }, [onConnected]);

  const open = step !== 'detecting' || wallets.length >= 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[420px]" showCloseButton={false} style={{ maxWidth: 420 }}>
        {/* Detecting */}
        {step === 'detecting' && (
          <div className="py-6 text-center">
            <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full border border-accent-border bg-accent-dim text-accent">
              <Loader2 className="size-6 animate-spin" />
            </div>
            <DialogTitle className="mb-2 text-lg">Detecting wallets...</DialogTitle>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Looking for Midnight wallet extensions in your browser.
            </p>
          </div>
        )}

        {/* Select Wallet */}
        {step === 'select' && (
          <>
            <DialogHeader className="text-left">
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="mb-1 text-lg">Connect Wallet</DialogTitle>
                  <DialogDescription>Select a Midnight wallet to connect.</DialogDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
                  <X className="size-4" />
                </Button>
              </div>
            </DialogHeader>
            <div className="flex flex-col gap-2.5">
              {wallets.map((w) => (
                <button
                  key={w.id}
                  onClick={() => handleConnect(w)}
                  disabled={loading}
                  className="flex w-full items-center gap-3.5 rounded-md border border-border bg-background p-3.5 text-left transition-all hover:border-accent-border hover:bg-card disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {w.icon ? (
                    <img src={w.icon} alt="" className="size-9 shrink-0 rounded-md" />
                  ) : (
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-accent-dim text-accent">
                      <Wallet className="size-4.5" />
                    </span>
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-foreground">{w.name}</div>
                    {w.rdns && (
                      <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">{w.rdns}</div>
                    )}
                  </div>
                  <ArrowRight className="size-4 text-accent" />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={onClose}
                className="flex w-full items-center justify-center rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-bg-hover hover:text-secondary-foreground"
              >
                Cancel
              </button>
              <button
                onClick={refresh}
                className="flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-bg-hover hover:text-secondary-foreground"
              >
                <RefreshCw className="size-3.5" />
                Refresh
              </button>
            </div>
          </>
        )}

        {/* Connecting */}
        {step === 'connecting' && (
          <div className="py-6 text-center">
            <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full border border-accent-border bg-accent-dim text-accent">
              <Loader2 className="size-6 animate-spin" />
            </div>
            <DialogTitle className="mb-2 text-lg">Connecting...</DialogTitle>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Please approve the connection in <span className="text-accent">{selectedWallet?.name}</span>.
            </p>
          </div>
        )}

        {/* Success */}
        {step === 'success' && (
          <div className="py-6 text-center">
            <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full border border-green/30 bg-green-bg text-green">
              <CheckCircle2 className="size-6" />
            </div>
            <DialogTitle className="mb-2 text-lg">Connected</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Wallet connected. Redirecting to dashboard...
            </p>
          </div>
        )}

        {/* Error */}
        {step === 'error' && (
          <div className="text-center">
            <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full border border-red/30 bg-red-bg text-red">
              <XCircle className="size-6" />
            </div>
            <DialogTitle className="mb-2 text-lg">No Wallet Found</DialogTitle>
            <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
              {error || 'No Midnight wallet extension detected.'}
              <br /><br />
              Install one of these Midnight wallets, refresh, and try again:
            </p>
            <div className="mb-5 flex flex-col gap-2 text-left">
              <a
                href="https://chromewebstore.google.com/detail/lace/cnkempipohcbaddhknkiilgfbhdbfhpn"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-accent-border hover:bg-card"
              >
                Lace Wallet
                <ArrowRight className="size-4 text-accent" />
              </a>
              <a
                href="https://1am.xyz"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-accent-border hover:bg-card"
              >
                1AM Wallet
                <ArrowRight className="size-4 text-accent" />
              </a>
              <a
                href="https://docs.midnight.network/use/getting-started/wallets"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-accent-border hover:bg-card"
              >
                View all Midnight wallets
                <ArrowRight className="size-4 text-accent" />
              </a>
            </div>
            <div className="flex justify-center gap-2.5">
              <Button onClick={refresh}>
                <RefreshCw className="size-4" />
                Retry
              </Button>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
