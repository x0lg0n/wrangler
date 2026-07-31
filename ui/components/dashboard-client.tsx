'use client';

import { useState, useCallback, useEffect } from 'react';
import { ExternalLink, Loader2, MessageSquare, Network, ShieldCheck, Wallet, XCircle, CheckCircle2 } from 'lucide-react';
import type { FeedbackEntry, Deployment } from '@/lib/contract-server';
import { getConnectedApi } from '@/lib/wallet';
import { saveFeedbackTx, getDeploymentInfo } from '@/app/actions';
import CopyButton from '@/components/copy-button';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  deployment: Deployment | null;
  error: string | null;
  initialFeedbacks: FeedbackEntry[];
  initialCount: number;
  chainCount: number | null;
}

const STEPS = [
  { stage: 'loading', label: 'Load ZK circuit', desc: 'Fetching proving keys' },
  { stage: 'connecting', label: 'Connect wallet & contract', desc: 'Locating deployment on indexer' },
  { stage: 'proving', label: 'Prove in wallet', desc: 'Approve the request in your wallet' },
  { stage: 'submitting', label: 'Sign & submit', desc: 'Balancing and submitting the transaction' },
  { stage: 'confirmed', label: 'Confirmed on-chain', desc: 'Feedback recorded on the ledger' },
] as const;

export default function DashboardClient({
  deployment,
  error,
  initialFeedbacks,
  initialCount,
  chainCount,
}: Props) {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState<string | null>(null);
  const [result, setResult] = useState<{ ok: boolean; text: string; txId?: string; warning?: string } | null>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>(initialFeedbacks);
  const [totalCount, setTotalCount] = useState(initialCount);
  const [walletAddr, setWalletAddr] = useState<string | null>(null);

  useEffect(() => {
    setWalletAddr(sessionStorage.getItem('wallet_address'));
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setResult(null);
    setStage('loading');
    try {
      const walletApi = getConnectedApi();
      if (!walletApi) {
        setResult({ ok: false, text: 'Wallet not connected. Please reconnect.' });
        setSubmitting(false);
        setStage(null);
        return;
      }

      const depInfo = await getDeploymentInfo();
      if (!depInfo) {
        setResult({ ok: false, text: 'No deployment info available.' });
        setSubmitting(false);
        setStage(null);
        return;
      }

      const { submitFeedbackViaWallet } = await import('@/lib/client-contract');
      const txHash = await submitFeedbackViaWallet(
        walletApi,
        message.trim(),
        depInfo.authSecret,
        depInfo.address,
        depInfo.network,
        setStage,
      );

      const fd = new FormData();
      fd.set('message', message.trim());
      fd.set('txHash', txHash);
      const res = await saveFeedbackTx(fd);

      if (res.ok && res.entry) {
        setResult({
          ok: true,
          text: 'ZK proof verified! Feedback submitted via your wallet.',
          txId: res.entry.txId,
          warning: res.warning,
        });
        setMessage('');
        setFeedbacks((prev) => [...prev, res.entry!]);
        setTotalCount((c) => c + 1);
      } else {
        setResult({ ok: false, text: res.error || 'Failed to save feedback' });
      }
    } catch (e: any) {
      setResult({ ok: false, text: e.message || 'Submission failed' });
    } finally {
      setSubmitting(false);
    }
  }, [message]);

  const handleDisconnect = () => {
    sessionStorage.removeItem('wallet_address');
    window.location.href = '/';
  };

  if (!walletAddr) {
    return (
      <main className="mx-auto flex w-full max-w-[960px] flex-col items-center px-6 py-20">
        <Card className="mx-auto w-full max-w-md items-center py-12 text-center">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="flex size-13 items-center justify-center rounded-full border border-accent-border bg-accent-dim text-accent">
              <Wallet className="size-5.5" />
            </div>
            <CardTitle className="text-xl">Wallet Required</CardTitle>
            <CardDescription className="max-w-xs leading-relaxed">
              Connect your Midnight wallet to submit ZK-verified feedback and access the dashboard.
            </CardDescription>
            <Button asChild className="mt-2">
              <a href="/">Connect Wallet</a>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const stepIndex = stage ? STEPS.findIndex((s) => s.stage === stage) : -1;
  const finished = !submitting && result?.ok;

  return (
    <main className="mx-auto w-full max-w-[960px] px-6 py-10">
      {/* Page hero */}
      <div className="mb-9 flex items-start justify-between gap-6 pt-2">
        <div>
          <h1 className="mb-1.5 text-[28px] font-bold tracking-[-0.5px]">Wrangler Dashboard</h1>
          <p className="max-w-[560px] text-sm leading-[1.7] text-muted-foreground">
            Submit anonymous, ZK-verified feedback. Your identity stays hidden —
            your wallet signs and submits the transaction to the Midnight ledger.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <span className="inline-block size-2 rounded-full bg-green shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
          <span className="text-[13px] font-medium">Wallet Connected</span>
          <Button variant="ghost" size="sm" onClick={handleDisconnect} className="text-xs text-muted-foreground">
            Disconnect
          </Button>
        </div>
      </div>

      {/* Stat grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3 rounded-[10px] border border-border bg-elevated p-5 backdrop-blur transition-colors hover:border-bg-hover">
          <div className="flex items-center justify-between">
            <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-bg text-accent"><Wallet className="size-4" /></span>
            <Badge variant="secondary" className="text-[11px]">{deployment?.network || 'Preview'}</Badge>
          </div>
          <div className="font-mono text-xl font-semibold leading-[1.2] tracking-[-0.5px] text-muted-foreground">{walletAddr.slice(0, 10)}...</div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Wallet</span>
            <CopyButton text={walletAddr} label="Copy address" />
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-[10px] border border-border bg-elevated p-5 backdrop-blur transition-colors hover:border-bg-hover">
          <div className="flex items-center justify-between">
            <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-bg text-accent"><ShieldCheck className="size-4" /></span>
            <Badge variant="secondary" className="text-[11px]" style={{ color: deployment ? 'var(--green)' : 'var(--red)' }}>
              {deployment ? 'Live' : 'Down'}
            </Badge>
          </div>
          <div className="font-mono text-xl font-semibold leading-[1.2] tracking-[-0.5px]">{deployment ? 'Active' : 'Offline'}</div>
          <div className="text-xs text-muted-foreground">Contract</div>
        </div>
        <div className="flex flex-col gap-3 rounded-[10px] border border-border bg-elevated p-5 backdrop-blur transition-colors hover:border-bg-hover">
          <div className="flex items-center justify-between">
            <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-bg text-accent"><Network className="size-4" /></span>
          </div>
          <div className="font-mono text-xl font-semibold leading-[1.2] tracking-[-0.5px] text-muted-foreground">{deployment?.network || 'Unknown'}</div>
          <div className="text-xs text-muted-foreground">Network</div>
        </div>
        <div className="flex flex-col gap-3 rounded-[10px] border border-border bg-elevated p-5 backdrop-blur transition-colors hover:border-bg-hover">
          <div className="flex items-center justify-between">
            <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-bg text-accent"><MessageSquare className="size-4" /></span>
          </div>
          <div className="font-mono text-xl font-semibold leading-[1.2] tracking-[-0.5px]">{totalCount}</div>
          <div className="text-xs text-muted-foreground">
            {chainCount !== null && chainCount !== totalCount ? `On-chain: ${chainCount}` : 'Feedback Submitted'}
          </div>
        </div>
      </div>

      {/* Contract Error */}
      {error && (
        <div className="mb-8 flex items-start gap-2.5 rounded-[10px] border border-red/20 bg-red-bg p-3.5 text-[13px] leading-[1.6] text-red">
          <XCircle className="mt-0.5 size-4 shrink-0" />
          <div>
            <div className="font-semibold">Contract Unreachable</div>
            <div className="mt-0.5 text-[11px] opacity-80">{error}</div>
          </div>
        </div>
      )}

      {/* Contract Info Card */}
      {deployment && (
        <Card className="mb-8 border-accent-border bg-[linear-gradient(135deg,var(--bg-card),var(--bg-elevated))]">
          <CardHeader className="flex-row items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="inline-block size-2 rounded-full bg-green shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
              <CardTitle className="text-base">Contract Live</CardTitle>
              <Badge variant="secondary" className="text-[11px]">{deployment.network}</Badge>
            </div>
            <Badge variant="secondary" className="text-[11px]">
              {chainCount !== null ? `${chainCount} on-chain` : 'querying…'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 text-[13px] sm:grid-cols-2">
              <div>
                <span className="mb-1.5 block text-[11px] font-medium tracking-[0.5px] text-muted-foreground uppercase">Contract Address</span>
                <div className="mt-1.5 flex flex-col items-end gap-1.5">
                  <div className="w-full break-all overflow-x-auto rounded-lg border border-border bg-code-bg px-3.5 py-2.5 font-mono text-xs text-secondary-foreground">{deployment.address}</div>
                  <CopyButton text={deployment.address} />
                </div>
              </div>
              <div>
                <span className="mb-1.5 block text-[11px] font-medium tracking-[0.5px] text-muted-foreground uppercase">Deployer</span>
                <div className="mt-1.5 flex flex-col items-end gap-1.5">
                  <div className="w-full break-all overflow-x-auto rounded-lg border border-border bg-code-bg px-3.5 py-2.5 font-mono text-xs text-secondary-foreground">{deployment.deployer}</div>
                  <CopyButton text={deployment.deployer} />
                </div>
              </div>
              <div>
                <span className="mb-1.5 block text-[11px] font-medium tracking-[0.5px] text-muted-foreground uppercase">Deployed</span>
                <div className="mt-1.5 text-sm text-foreground">{new Date(deployment.deployedAt).toLocaleString()}</div>
              </div>
              <div>
                <span className="mb-1.5 block text-[11px] font-medium tracking-[0.5px] text-muted-foreground uppercase">On-Chain Feedbacks</span>
                <div className="mt-1.5">
                  {chainCount !== null ? (
                    <span className="font-mono text-xl font-semibold tracking-[-0.5px]">{chainCount}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unavailable</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Submit Feedback</CardTitle>
          <CardDescription className="leading-relaxed">
            Your credential is hashed and verified via a zero-knowledge circuit. The feedback
            is disclosed to the public ledger — your identity stays hidden.
            Your wallet signs and submits the transaction.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Textarea
            className="min-h-[90px] resize-y"
            placeholder="Write your anonymous feedback..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={2000}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled={submitting || !message.trim()} onClick={handleSubmit}>
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {submitting ? 'Verifying & Signing...' : 'Submit Feedback'}
            </Button>
            <span className="ml-auto text-[11px] text-muted-foreground">
              {message.trim().length}/2000
            </span>
          </div>

          {submitting && stage && (
            <div className="mt-1 flex flex-col rounded-lg border border-border bg-background px-4 pt-4 pb-1">
              {STEPS.map((step, i) => {
                const isDone = i < stepIndex || finished;
                const isActive = i === stepIndex && !finished;
                return (
                  <div
                    key={step.stage}
                    className={`relative flex items-start gap-3 pb-5 last:pb-0 before:absolute before:top-[26px] before:bottom-0 before:left-[11px] before:w-0.5 ${isDone ? 'before:bg-accent-border' : 'before:bg-border'}`}
                  >
                    <div
                      className={`relative z-[1] flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${
                        isDone
                          ? 'border-accent bg-accent text-on-accent'
                          : isActive
                            ? 'border-accent text-accent shadow-[0_0_14px_rgba(var(--accent-rgb),0.35)]'
                            : 'border-border bg-bg text-muted-foreground'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="size-3" />
                      ) : isActive ? (
                        <div className="size-3 animate-spin rounded-full border-[1.5px] border-accent/30 border-t-accent" />
                      ) : (
                        i + 1
                      )}
                    </div>
                    <div>
                      <div className={`text-[13px] font-medium leading-[1.4] ${isDone || isActive ? '' : 'text-muted-foreground'}`}>
                        {step.label}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{isDone ? 'Done' : step.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {result && (
            <div
              className={`flex items-start gap-2.5 rounded-[10px] p-3.5 text-[13px] leading-[1.6] ${
                result.ok
                  ? 'border border-green/20 bg-green-bg text-green'
                  : 'border border-red/20 bg-red-bg text-red'
              }`}
            >
              {result.ok ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : <XCircle className="mt-0.5 size-4 shrink-0" />}
              <div>
                <div className="font-semibold">{result.text}</div>
                {result.txId && deployment && (
                  <div className="mt-0.5 text-[11px] opacity-80">
                    <a
                      href={`https://explorer.${deployment.network}.midnight.network/transactions/${result.txId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2"
                    >
                      View on explorer: {result.txId}
                    </a>
                  </div>
                )}
                {result.warning && (
                  <div className="mt-1.5 text-[11px] text-amber-500">
                    Stored in this session only — Redis save failed: {result.warning}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feedback List */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Public Feedback</CardTitle>
          <Badge variant="secondary" className="text-[11px]">{feedbacks.length} total</Badge>
        </CardHeader>
        <CardContent>
          {feedbacks.length === 0 && (
            <div className="px-6 py-12 text-center text-muted-foreground">
              <div className="mb-3 flex justify-center opacity-30">
                <MessageSquare className="size-10" />
              </div>
              <div className="text-sm">No feedback submitted yet.</div>
              <div className="mt-2 text-xs">
                Use the form above to submit your first ZK-verified feedback.
              </div>
            </div>
          )}
          {feedbacks.length > 0 && (
            <div className="flex flex-col gap-3">
              {[...feedbacks].reverse().map((fb, i) => (
                <div key={`${fb.timestamp}-${fb.id}-${i}`} className="rounded-[10px] border border-border bg-feedback-bg p-5 transition-colors hover:border-bg-hover">
                  <div className="mb-2.5 flex items-center justify-between gap-3">
                    <span className="font-mono text-xs text-muted-foreground">#{fb.id ?? '-'}</span>
                    <Badge
                      variant="outline"
                      className="px-2 py-0.5 text-[11px]"
                      style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
                    >
                      ZK verified
                    </Badge>
                  </div>
                  <div className="text-sm leading-[1.7]">{fb.message}</div>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(fb.timestamp).toLocaleString()}
                    </span>
                    {fb.txId && deployment && (
                      <a
                        href={`https://explorer.${deployment.network}.midnight.network/transactions/${fb.txId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-mono text-[11px] text-accent no-underline"
                      >
                        <ExternalLink className="size-2.5" />
                        {fb.txId.slice(0, 20)}...
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
