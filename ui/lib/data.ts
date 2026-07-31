import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

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
    const deployment = state.deployments[network]?.whistleblower;
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

export function saveFeedback(message: string, deployment: Deployment): FeedbackEntry {
  const feedbacks = loadFeedbacks();
  const nextId = feedbacks.reduce((max, f) => Math.max(max, f.id), 0) + 1;
  const entry: FeedbackEntry = {
    id: nextId,
    message,
    timestamp: new Date().toISOString(),
    txId: `${deployment.address.slice(0, 16)}-${nextId}`,
  };
  feedbacks.push(entry);
  writeFileSync(feedbacksPath, JSON.stringify(feedbacks, null, 2));
  return entry;
}
