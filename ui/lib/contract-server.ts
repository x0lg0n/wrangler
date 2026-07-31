import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { decodeFeedbackCount } from '@/lib/contract-ledger';

const rootDir = resolve(process.cwd(), '..');
const statePath = resolve(rootDir, '.midnight-state.json');
const feedbacksPath = resolve(rootDir, '.feedbacks.json');

interface StateJson {
  activeNetwork: string;
  deployments: Record<string, Record<string, { address: string; deployer: string; deployedAt: string; authSecret?: string }>>;
}

export interface Deployment {
  address: string;
  network: string;
  deployer: string;
  deployedAt: string;
  authSecret?: string;
}

export interface FeedbackEntry {
  id: number;
  message: string;
  timestamp: string;
  txId: string;
}

const NETWORK_URLS: Record<string, { indexer: string }> = {
  preview: { indexer: 'https://indexer.preview.midnight.network/api/v4/graphql' },
  preprod: { indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql' },
};

const envDeployment = (): Deployment | null => {
  const raw = process.env.MIDNIGHT_DEPLOYMENT;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.address && parsed?.network) return parsed as Deployment;
    return null;
  } catch {
    return null;
  }
};

export function readDeployment(): { deployment: Deployment | null; error: string | null } {
  const fromEnv = envDeployment();
  if (fromEnv) return { deployment: fromEnv, error: null };
  try {
    if (!existsSync(statePath)) {
      return { deployment: null, error: 'No deployment state found.' };
    }
    const raw = readFileSync(statePath, 'utf-8');
    const state: StateJson = JSON.parse(raw);
    const network = state.activeNetwork;
    const dep = state.deployments[network]?.wrangler;
    if (!dep) {
      return { deployment: null, error: `No deployment for network "${network}".` };
    }
    return { deployment: { address: dep.address, network, deployer: dep.deployer, deployedAt: dep.deployedAt, authSecret: dep.authSecret }, error: null };
  } catch (err: any) {
    return { deployment: null, error: err.message };
  }
}

export function readAuthSecret(): string | null {
  const fromEnv = envDeployment();
  if (fromEnv?.authSecret) return fromEnv.authSecret;
  try {
    if (!existsSync(statePath)) return null;
    const raw = readFileSync(statePath, 'utf-8');
    const state: StateJson = JSON.parse(raw);
    const dep = state.deployments[state.activeNetwork]?.wrangler;
    return dep?.authSecret ?? null;
  } catch {
    return null;
  }
}

export function loadFeedbacks(): FeedbackEntry[] {
  const fromEnv = process.env.MIDNIGHT_FEEDBACKS;
  if (fromEnv) {
    try {
      return JSON.parse(fromEnv) as FeedbackEntry[];
    } catch {
      return [];
    }
  }
  if (!existsSync(feedbacksPath)) return [];
  try {
    return JSON.parse(readFileSync(feedbacksPath, 'utf-8'));
  } catch {
    return [];
  }
}

export function saveFeedback(message: string, txHash: string): FeedbackEntry {
  const list = loadFeedbacks();
  const nextId = list.reduce((max, f) => Math.max(max, f.id ?? 0), 0) + 1;
  const entry: FeedbackEntry = {
    id: nextId,
    message,
    timestamp: new Date().toISOString(),
    txId: txHash,
  };
  list.push(entry);
  try {
    writeFileSync(feedbacksPath, JSON.stringify(list, null, 2));
  } catch {
    // read-only filesystem (serverless): keep the entry in memory only
  }
  return entry;
}

export async function queryChainCount(address: string, network: string): Promise<number | null> {
  const urls = NETWORK_URLS[network];
  if (!urls) return null;
  try {
    const query = `query ContractState($address: String!) {
      contract(address: $address) { state }
    }`;
    const resp = await fetch(urls.indexer, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { address } }),
      cache: 'no-store',
    });
    const json = await resp.json();
    const stateHex: string | undefined = json?.data?.contract?.state;
    if (!stateHex) return null;
    return decodeFeedbackCount(stateHex);
  } catch {
    return null;
  }
}
