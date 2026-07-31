'use client';

import { Buffer } from 'buffer';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { createProofProvider } from '@midnight-ntwrk/midnight-js-types';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import * as WranglerModule from '@midnight-ntwrk/wrangler-contract';
import { createWranglerPrivateState } from '@midnight-ntwrk/wrangler-contract';

let ledger: any = null;

async function getLedger() {
  if (!ledger) {
    ledger = await import('@midnight-ntwrk/midnight-js-protocol/ledger');
  }
  return ledger;
}

class WalletBridge {
  private coinPublicKey = '';
  private encryptionPublicKey = '';

  constructor(private api: any) {}

  async init() {
    const addrs = await this.api.getShieldedAddresses();
    this.coinPublicKey = addrs.shieldedCoinPublicKey;
    this.encryptionPublicKey = addrs.shieldedEncryptionPublicKey;
  }

  getCoinPublicKey() {
    return this.coinPublicKey;
  }

  getEncryptionPublicKey() {
    return this.encryptionPublicKey;
  }

  async balanceTx(tx: any, _ttl?: Date) {
    const l = await getLedger();
    const hex = Buffer.from(tx.serialize()).toString('hex');
    const { tx: balancedHex } = await this.api.balanceUnsealedTransaction(hex);
    return l.Transaction.deserialize('signature', 'proof', 'binding', Buffer.from(balancedHex, 'hex'));
  }

  async submitTx(tx: any) {
    const hex = Buffer.from(tx.serialize()).toString('hex');
    await this.api.submitTransaction(hex);
    return tx.identifiers().at(-1);
  }
}

export type SubmitStage = 'loading' | 'connecting' | 'proving' | 'submitting' | 'confirmed';

export async function submitFeedbackViaWallet(
  walletApi: any,
  feedback: string,
  authSecret: string,
  contractAddress: string,
  network: string,
  onStage?: (stage: SubmitStage) => void,
): Promise<string> {
  onStage?.('loading');
  const l = await getLedger();

  const networkId = network === 'preprod' ? 'preprod' : 'preview';
  setNetworkId(networkId as any);

  const zkBase = typeof window !== 'undefined'
    ? `${window.location.origin}/zk`
    : 'http://localhost:3000/zk';
  const zkConfigProvider = new FetchZkConfigProvider(
    zkBase,
    typeof window !== 'undefined' ? window.fetch.bind(window) : undefined,
  );

  const walletBridge = new WalletBridge(walletApi);
  await walletBridge.init();
  const accountId = walletBridge.getCoinPublicKey();

  const indexerUrl = network === 'preprod'
    ? 'https://indexer.preprod.midnight.network/api/v4/graphql'
    : 'https://indexer.preview.midnight.network/api/v4/graphql';
  const indexerWsUrl = network === 'preprod'
    ? 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws'
    : 'wss://indexer.preview.midnight.network/api/v4/graphql/ws';

  const privateStateProvider = levelPrivateStateProvider({
    privateStateStoreName: 'wrangler-state',
    accountId,
    privateStoragePasswordProvider: () => 'Local-Devnet-Development-Placeholder-1',
  });

  const publicDataProvider = indexerPublicDataProvider(indexerUrl, indexerWsUrl);

  const keyMaterialProvider = zkConfigProvider.asKeyMaterialProvider();
  onStage?.('connecting');
  const provingProvider = await walletApi.getProvingProvider(keyMaterialProvider);
  const proofProvider = createProofProvider(provingProvider);

  const compiledContract = CompiledContract.make(
    'Whistleblower',
    WranglerModule.Contract,
  ).pipe(CompiledContract.withVacantWitnesses);

  const providers = {
    privateStateProvider,
    publicDataProvider,
    zkConfigProvider,
    proofProvider,
    walletProvider: walletBridge,
    midnightProvider: walletBridge,
  } as any;

  onStage?.('proving');
  const deployed = await findDeployedContract(providers, {
    compiledContract: compiledContract as any,
    contractAddress,
    privateStateId: 'wranglerPrivateState',
    initialPrivateState: createWranglerPrivateState(),
  });

  const credBytes = new TextEncoder().encode(authSecret);
  const credHash = new Uint8Array(await crypto.subtle.digest('SHA-256', credBytes));

  onStage?.('submitting');
  const txData = await deployed.callTx.submitFeedback(feedback, credHash);

  onStage?.('confirmed');
  return txData.public.txHash;
}
