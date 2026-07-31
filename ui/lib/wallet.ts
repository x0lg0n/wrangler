'use client';

export interface WalletInfo {
  id: string;
  name: string;
  icon: string;
  rdns: string;
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

export function detectWallets(): WalletInfo[] {
  if (typeof window === 'undefined') return [];
  const midnight = (window as any).midnight;
  if (!midnight) return [];

  return Object.entries(midnight).map(([id, api]: [string, any]) => ({
    id,
    name: api.name || id,
    icon: api.icon || '',
    rdns: api.rdns || '',
  }));
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
