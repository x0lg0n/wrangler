import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadFeedbacksFromStore, appendFeedback } from '@/lib/feedback-store';

export { getStoreDiagnostics } from '@/lib/feedback-store';

const rootDir = resolve(process.cwd(), '..');
const statePath = resolve(rootDir, '.midnight-state.json');
const feedbacksPath = resolve(rootDir, '.feedbacks.json');

export interface Deployment {
  address: string;
  network: string;
  deployer: string;
  deployedAt: string;
}

export interface FeedbackEntry {
  id: number;
  message: string;
  timestamp: string;
  txId?: string;
}

export interface State {
  activeNetwork: string;
  wallets: Record<string, { seed: string }>;
  deployments: Record<string, Record<string, { address: string; deployer: string; deployedAt: string }>>;
}

export function readState(): { deployment: Deployment | null; error: string | null } {
  const fromEnv = process.env.MIDNIGHT_DEPLOYMENT;
  if (fromEnv) {
    try {
      const parsed = JSON.parse(fromEnv);
      if (parsed?.address && parsed?.network) {
        return {
          deployment: { address: parsed.address, network: parsed.network, deployer: parsed.deployer, deployedAt: parsed.deployedAt },
          error: null,
        };
      }
    } catch {
      return { deployment: null, error: 'MIDNIGHT_DEPLOYMENT is not valid JSON.' };
    }
  }
  try {
    if (!existsSync(statePath)) {
      return { deployment: null, error: 'No deployment state found. Run pnpm run deploy first.' };
    }
    const raw = readFileSync(statePath, 'utf-8');
    const state: State = JSON.parse(raw);
    const network = state.activeNetwork;
    const deployment = state.deployments[network]?.wrangler;
    if (!deployment) {
      return { deployment: null, error: `No deployment found for network "${network}".` };
    }
    return {
      deployment: {
        address: deployment.address,
        network,
        deployer: deployment.deployer,
        deployedAt: deployment.deployedAt,
      },
      error: null,
    };
  } catch (err: any) {
    return { deployment: null, error: err.message };
  }
}

export async function loadFeedbacks(): Promise<FeedbackEntry[]> {
  return (await loadFeedbacksFromStore()) as FeedbackEntry[];
}

export async function saveFeedback(message: string, deployment: Deployment): Promise<FeedbackEntry> {
  return (await appendFeedback(message, `${deployment.address.slice(0, 16)}-`)).entry as unknown as FeedbackEntry;
}
