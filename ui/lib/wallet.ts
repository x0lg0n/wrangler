'use client';

export interface WalletInfo {
  id: string;
  name: string;
  icon: string;
  rdns: string;
  apiVersion: string;
}

export interface WalletState {
  address: string;
  networkId: string;
}

let _connectedApi: any = null;

export function setConnectedApi(api: any) {
  _connectedApi = api;
}

export function getConnectedApi(): any {
  return _connectedApi;
}

interface KnownWallet {
  match: RegExp;
  name: string;
}

const KNOWN_WALLETS: KnownWallet[] = [
  { match: /lace|io\.midnight\.lace/i, name: 'Lace Wallet' },
  { match: /1am|io\.wh1te|i-am|i_am/i, name: '1AM Wallet' },
  { match: /midnight/i, name: 'Midnight Wallet' },
];

function findKnownWallet(id: string, name: string, rdns: string): KnownWallet | undefined {
  const haystack = `${id} ${name} ${rdns}`;
  return KNOWN_WALLETS.find((k) => k.match.test(haystack));
}

function versionRank(version?: string): number[] {
  return String(version || '')
    .replace(/[^0-9.]/g, '')
    .split('.')
    .map((n) => parseInt(n, 10) || 0);
}

function isNewer(a?: string, b?: string): boolean {
  const [ra, rb] = [versionRank(a), versionRank(b)];
  for (let i = 0; i < Math.max(ra.length, rb.length); i++) {
    const diff = (ra[i] ?? 0) - (rb[i] ?? 0);
    if (diff !== 0) return diff > 0;
  }
  return false;
}

export function detectWallets(): WalletInfo[] {
  if (typeof window === 'undefined') return [];
  const midnight = (window as any).midnight;
  if (!midnight) return [];

  const byRdns = new Map<string, { id: string; api: any }>();

  for (const [id, api] of Object.entries(midnight) as [string, any][]) {
    if (!api || typeof api.connect !== 'function') continue;
    const rdns = api.rdns || id;
    const existing = byRdns.get(rdns);
    if (existing && isNewer(existing.api.apiVersion, api.apiVersion)) continue;
    byRdns.set(rdns, { id, api });
  }

  return [...byRdns.values()]
    .map(({ id, api }) => {
      const known = findKnownWallet(id, api.name, api.rdns);
      return {
        id,
        name: known?.name || api.name || 'Midnight Wallet',
        icon: api.icon || '',
        rdns: api.rdns || id,
        apiVersion: api.apiVersion || '',
      };
    })
    .sort((a, b) => {
      const ai = KNOWN_WALLETS.findIndex((k) => k.match.test(`${a.id} ${a.name} ${a.rdns}`));
      const bi = KNOWN_WALLETS.findIndex((k) => k.match.test(`${b.id} ${b.name} ${b.rdns}`));
      return (ai === -1 ? KNOWN_WALLETS.length : ai) - (bi === -1 ? KNOWN_WALLETS.length : bi)
        || a.name.localeCompare(b.name);
    });
}

export async function connectWallet(id: string, networkId = 'preview'): Promise<{ state: WalletState; api: any }> {
  if (typeof window === 'undefined') throw new Error('Not in browser');
  const midnight = (window as any).midnight;
  if (!midnight?.[id]) throw new Error('Wallet not found');

  const api: any = await midnight[id].connect(networkId);
  _connectedApi = api;
  const addr = await api.getUnshieldedAddress();

  return {
    state: {
      address: addr.unshieldedAddress,
      networkId,
    },
    api,
  };
}
