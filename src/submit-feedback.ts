import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';

import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import * as ledger from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import {
  WalletFacade,
  ShieldedWallet,
  DustWallet,
  UnshieldedWallet,
  Roles,
  HDWallet,
  createKeystore,
  NoOpTransactionHistoryStorage,
  PublicKey,
} from '@midnight-ntwrk/wallet-sdk';

globalThis.WebSocket = WebSocket;

const PRIVATE_STATE_ID = 'whistleblowerPrivateState';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const zkConfigPath = path.resolve(rootDir, 'contract', 'src', 'managed', 'whistleblower');
const statePath = path.resolve(rootDir, '.midnight-state.json');

function readState() {
  if (!fs.existsSync(statePath)) return null;
  return JSON.parse(fs.readFileSync(statePath, 'utf-8'));
}

function deriveKeys(seed: string) {
  const hdWallet = HDWallet.fromSeed(Buffer.from(seed, 'hex'));
  if (hdWallet.type !== 'seedOk') throw new Error('Invalid seed');
  const result = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);
  if (result.type !== 'keysDerived') throw new Error('Key derivation failed');
  hdWallet.hdWallet.clear();
  return result.keys;
}

const NETWORK_CONFIGS: Record<string, { indexer: string; indexerWS: string; node: string; proofServer: string }> = {
  preview: {
    indexer: 'https://indexer.preview.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
    node: 'https://rpc.preview.midnight.network',
    proofServer: 'http://127.0.0.1:6300',
  },
  preprod: {
    indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    node: 'https://rpc.preprod.midnight.network',
    proofServer: 'http://127.0.0.1:6300',
  },
  undeployed: {
    indexer: 'http://127.0.0.1:8088/api/v4/graphql',
    indexerWS: 'ws://127.0.0.1:8088/api/v4/graphql/ws',
    node: 'ws://127.0.0.1:9944',
    proofServer: 'http://127.0.0.1:6300',
  },
};

async function main() {
  const feedback = process.argv[2];
  if (!feedback) {
    process.stderr.write('Usage: tsx src/submit-feedback.ts <feedback_text>\n');
    process.exit(1);
  }

  const state = readState();
  if (!state) {
    process.stderr.write('No deployment state found. Run deploy first.\n');
    process.exit(1);
  }

  const network: string = state.activeNetwork;
  const dep = state.deployments?.[network]?.whistleblower;
  if (!dep) {
    process.stderr.write(`No deployment for network "${network}".\n`);
    process.exit(1);
  }

  const authSecret = dep.authSecret;
  if (!authSecret) {
    process.stderr.write('No auth secret found.\n');
    process.exit(1);
  }

  const seed = state.wallets?.[network]?.seed;
  if (!seed) {
    process.stderr.write('No wallet seed found.\n');
    process.exit(1);
  }

  const networkConfig = NETWORK_CONFIGS[network];
  if (!networkConfig) {
    process.stderr.write(`Unknown network config: ${network}\n`);
    process.exit(1);
  }

  const contractIndexPath = path.resolve(rootDir, 'contract', 'src', 'index.ts');
  const { CompiledWhistleblowerContractContract, createWhistleblowerPrivateState } = await import(pathToFileURL(contractIndexPath).href);

  setNetworkId(network as any);

  const keys = deriveKeys(seed);
  const networkId = getNetworkId();
  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], networkId);

  const wallet = await WalletFacade.init({
    configuration: {
      networkId,
      indexerClientConnection: {
        indexerHttpUrl: networkConfig.indexer,
        indexerWsUrl: networkConfig.indexerWS,
      },
      provingServerUrl: new URL(networkConfig.proofServer),
      relayURL: new URL(networkConfig.node.replace(/^http/, 'ws')),
      txHistoryStorage: new NoOpTransactionHistoryStorage(),
      costParameters: { additionalFeeOverhead: BigInt('300000000000000'), feeBlocksMargin: 5 },
    },
    shielded: (config) => ShieldedWallet(config).startWithSecretKeys(shieldedSecretKeys),
    unshielded: (config) => UnshieldedWallet(config).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore)),
    dust: (config) => DustWallet(config).startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust),
  });

  await wallet.start(shieldedSecretKeys, dustSecretKey);
  await wallet.waitForSyncedState();

  const accountId = unshieldedKeystore.getBech32Address().toString();
  const privateStatePassword = process.env.PRIVATE_STATE_PASSWORD?.trim() || 'Local-Devnet-Development-Placeholder-1';

  const walletProvider = {
    getCoinPublicKey: () => shieldedSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => shieldedSecretKeys.encryptionPublicKey,
    balanceTx: async (tx: any, ttl?: Date) => {
      const recipe = await wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys, dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      return wallet.finalizeRecipe(recipe);
    },
    submitTx: (tx: any) => wallet.submitTransaction(tx) as any,
  };

  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);

  const providers = {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'whistleblower-state',
      accountId,
      privateStoragePasswordProvider: () => privateStatePassword,
    }),
    publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };

  const deployed = await findDeployedContract(providers, {
    compiledContract: CompiledWhistleblowerContractContract as any,
    contractAddress: dep.address,
    privateStateId: PRIVATE_STATE_ID,
    initialPrivateState: createWhistleblowerPrivateState(),
  });

  const credHash = crypto.createHash('sha256').update(authSecret).digest();
  const txData = await deployed.callTx.submitFeedback(feedback, credHash);

  await wallet.stop();

  process.stdout.write(JSON.stringify({
    ok: true,
    txHash: txData.public.txHash,
    blockHeight: String(txData.public.blockHeight),
  }));
}

main().catch((err) => {
  process.stderr.write(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
