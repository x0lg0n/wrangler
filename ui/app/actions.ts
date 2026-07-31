'use server';

import { readDeployment, loadFeedbacks, saveFeedback, queryChainCount, readAuthSecret, type Deployment, type FeedbackEntry } from '@/lib/contract-server';
import { submitFeedback as realSubmit } from '@/lib/server-contract';

export async function getContractData(): Promise<{
  deployment: Deployment | null;
  error: string | null;
  chainCount: number | null;
}> {
  const result = readDeployment();
  let chainCount: number | null = null;
  if (result.deployment) {
    chainCount = await queryChainCount(result.deployment.address, result.deployment.network);
  }
  return { ...result, chainCount };
}

export async function getDeploymentInfo(): Promise<{ address: string; network: string; authSecret: string } | null> {
  const { deployment } = readDeployment();
  const authSecret = readAuthSecret();
  if (!deployment || !authSecret) return null;
  return { address: deployment.address, network: deployment.network, authSecret };
}

export async function getFeedbacks(): Promise<FeedbackEntry[]> {
  return loadFeedbacks();
}

export async function saveFeedbackTx(formData: FormData) {
  const message = formData.get('message');
  const txHash = formData.get('txHash');

  if (!message || typeof message !== 'string' || !message.trim()) {
    return { ok: false, error: 'message is required' };
  }
  if (!txHash || typeof txHash !== 'string' || !txHash.trim()) {
    return { ok: false, error: 'txHash is required' };
  }

  const result = await saveFeedback(message.trim(), txHash.trim());
  return {
    ok: true,
    entry: result.entry,
    warning: result.persisted === 'redis' ? undefined : result.error || `not persisted (${result.persisted})`,
  };
}

export async function submitFeedback(formData: FormData) {
  const message = formData.get('message');

  if (!message || typeof message !== 'string' || !message.trim()) {
    return { ok: false, error: 'message is required' };
  }

  const result = await realSubmit(message.trim());

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  const saved = await saveFeedback(message.trim(), result.txHash);

  return {
    ok: true,
    entry: saved.entry,
    warning: saved.persisted === 'redis' ? undefined : saved.error || `not persisted (${saved.persisted})`,
  };
}
