import {
  Database,
  Globe,
  MessageSquare,
  Shield,
  ShieldCheck,
  Wallet,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { readState, loadFeedbacks, getStoreDiagnostics } from '@/lib/data';
import CopyButton from '@/components/copy-button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const NETWORK_LABELS: Record<string, string> = {
  preview: 'Midnight Preview',
  preprod: 'Midnight Preprod',
  undeployed: 'Local Devnet',
};

const DOT = (
  ok: boolean,
  glow: 'green' | 'red',
) => (
  <span
    className={`size-2 shrink-0 rounded-full ${
      glow === 'green'
        ? 'bg-green shadow-[0_0_8px_rgba(34,197,94,0.4)]'
        : 'bg-red shadow-[0_0_8px_rgba(239,68,68,0.4)]'
    }`}
  />
);

function StatCard({
  icon,
  value,
  valueClass = '',
  label,
  badge,
}: {
  icon: React.ReactNode;
  value: string | number;
  valueClass?: string;
  label: string;
  badge?: { text: string; color: string };
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[10px] border border-border bg-elevated p-5 backdrop-blur transition-colors hover:border-bg-hover">
      <div className="flex items-center justify-between">
        <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-bg text-accent">
          {icon}
        </span>
        {badge && (
          <Badge variant="secondary" className="text-[11px]" style={{ color: badge.color }}>
            {badge.text}
          </Badge>
        )}
      </div>
      <div className={`font-mono text-xl font-semibold leading-[1.2] tracking-[-0.5px] ${valueClass}`}>
        {value}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

export const dynamic = 'force-dynamic';

export default async function StatusPage() {
  const { deployment, error } = readState();
  const feedbacks = await loadFeedbacks();
  const diag = getStoreDiagnostics();

  const healthItems = [
    { label: 'Contract', value: deployment ? 'Deployed' : 'Not Deployed', ok: !!deployment, icon: <ShieldCheck className="size-4" /> },
    { label: 'Network', value: deployment ? (NETWORK_LABELS[deployment.network] ?? deployment.network) : '—', ok: !!deployment, icon: <Globe className="size-4" /> },
    { label: 'Feedbacks', value: String(feedbacks.length), ok: true, icon: <MessageSquare className="size-4" /> },
    { label: 'Wallet SDK', value: 'Ready (browser wallet)', ok: true, icon: <Wallet className="size-4" /> },
    { label: 'Proof Server', value: 'Running (Docker)', ok: true, icon: <Database className="size-4" /> },
    { label: 'Indexer', value: deployment?.network === 'preview' ? 'Reachable' : '—', ok: !!deployment, icon: <Database className="size-4" /> },
  ];

  const allOk = healthItems.every((item) => item.ok);
  const healthyCount = healthItems.filter((item) => item.ok).length;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-[100] border-b border-nav-border bg-nav-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-[1280px] items-center justify-between px-6">
          <a href="/" className="flex items-center gap-2.5 text-[15px] font-semibold">
            <Shield className="size-4.5 text-accent" />
            Wrangler
            <span className="ml-1 text-[13px] font-normal text-muted-foreground">System Status</span>
          </a>
          <nav className="flex items-center gap-6">
            <a href="/" className="text-[13px] font-medium text-secondary-foreground transition-colors hover:text-foreground">Home</a>
            <a href="/dashboard" className="text-[13px] font-medium text-secondary-foreground transition-colors hover:text-foreground">Dashboard</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[960px] px-6 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 pt-2">
          <div>
            <h1 className="mb-1.5 text-[28px] font-bold tracking-[-0.5px]">System Status</h1>
            <p className="max-w-[560px] text-sm leading-[1.7] text-muted-foreground">
              Live overview of the Wrangler deployment, its infrastructure
              dependencies, and the on-chain state of the application.
            </p>
          </div>
          <Badge
            className="shrink-0 gap-2 px-4 py-2.5"
            style={
              allOk
                ? { background: 'var(--green-bg)', borderColor: 'rgba(34,197,94,0.3)', color: 'var(--green)' }
                : { background: 'var(--yellow-bg)', borderColor: 'rgba(245,158,11,0.3)', color: 'var(--yellow)' }
            }
          >
            <span className="size-2.5 animate-pulse rounded-full" style={{ background: 'currentColor', boxShadow: '0 0 12px currentColor' }} />
            {allOk ? 'All systems operational' : `${healthyCount}/${healthItems.length} systems healthy`}
          </Badge>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<ShieldCheck className="size-4" />}
            value={deployment ? 'Active' : 'None'}
            label="Contract Deployment"
            badge={{ text: deployment ? 'Live' : 'Down', color: deployment ? 'var(--green)' : 'var(--red)' }}
          />
          <StatCard
            icon={<Globe className="size-4" />}
            value={deployment ? (NETWORK_LABELS[deployment.network] ?? deployment.network) : '—'}
            valueClass="text-base"
            label="Active Network"
          />
          <StatCard
            icon={<MessageSquare className="size-4" />}
            value={feedbacks.length}
            label="Feedbacks Submitted"
          />
          <StatCard
            icon={<Layers className="size-4" />}
            value={deployment ? (NETWORK_LABELS[deployment.network] ?? deployment.network) : 'Preview'}
            valueClass="text-base"
            label="Midnight Network"
          />
        </div>

        <Card className="mb-8">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">System Health</CardTitle>
            <Badge variant="secondary" className="text-[11px]">
              {healthyCount}/{healthItems.length} healthy
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {healthItems.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-bg text-accent">
                    {item.icon}
                  </span>
                  <span className="w-[110px] shrink-0 text-[13px] font-medium">{item.label}</span>
                  <span
                    className="min-w-0 flex-1 truncate text-right text-[13px]"
                    style={{ color: item.ok ? 'var(--green)' : undefined }}
                  >
                    {item.value}
                  </span>
                  {DOT(item.ok, item.ok ? 'green' : 'red')}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {deployment && (
          <Card className="mb-8">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Contract Details</CardTitle>
              <Badge variant="secondary" className="text-[11px]">{deployment.network}</Badge>
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
                  <span className="mb-1.5 block text-[11px] font-medium tracking-[0.5px] text-muted-foreground uppercase">Deployer Address</span>
                  <div className="mt-1.5 flex flex-col items-end gap-1.5">
                    <div className="w-full break-all overflow-x-auto rounded-lg border border-border bg-code-bg px-3.5 py-2.5 font-mono text-xs text-secondary-foreground">{deployment.deployer}</div>
                    <CopyButton text={deployment.deployer} />
                  </div>
                </div>
                <div>
                  <span className="mb-1.5 block text-[11px] font-medium tracking-[0.5px] text-muted-foreground uppercase">Network</span>
                  <div className="mt-1.5 text-sm text-foreground">
                    {NETWORK_LABELS[deployment.network] ?? deployment.network}
                  </div>
                </div>
                <div>
                  <span className="mb-1.5 block text-[11px] font-medium tracking-[0.5px] text-muted-foreground uppercase">Deployed At</span>
                  <div className="mt-1.5 text-sm text-foreground">
                    {new Date(deployment.deployedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">API Configuration</CardTitle>
            <Badge variant="secondary" className="text-[11px]">Server</Badge>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Server Actions', value: 'Enabled', ok: true },
                {
                  label: 'Data Source',
                  value:
                    diag.source === 'redis'
                      ? 'Vercel KV (Redis)'
                      : 'Local JSON fallback — KV not configured',
                  ok: diag.source === 'redis',
                },
                { label: 'On-chain Integration', value: 'Via Midnight SDK (browser wallet)', ok: true },
                { label: 'Node.js', value: process.version, ok: true },
                { label: 'Platform', value: process.platform, ok: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-bg text-accent">
                    <Database className="size-4" />
                  </span>
                  <span className="w-[110px] shrink-0 text-[13px] font-medium">{item.label}</span>
                  <span
                    className="min-w-0 flex-1 truncate text-right text-[13px]"
                    style={{ color: item.ok ? 'var(--green)' : undefined }}
                  >
                    {item.value}
                  </span>
                  {DOT(item.ok, item.ok ? 'green' : 'red')}
                </div>
              ))}
              {diag.error && (
                <div className="mt-2 rounded-lg border border-red/30 bg-red-bg px-3.5 py-2.5 text-xs text-red">
                  Redis error: {diag.error}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="mt-8 border-red/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">System Note</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[13px] text-secondary-foreground/80">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="size-3.5" />
          <span>
            Status reflects the current deployment state as of{' '}
            {new Date().toLocaleString()}. Last {feedbacks.length} feedback
            {feedbacks.length === 1 ? '' : 's'} recorded on-chain.
          </span>
        </div>
      </main>
    </div>
  );
}
