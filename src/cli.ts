import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
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
import { resolveNetwork, getOrCreateSeed, getDeployment, loadState } from './network';
import { createWallet, persistWalletState, unshieldedToken } from './wallet';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const feedbacksPath = resolve(process.cwd(), '.feedbacks.json');

interface StoredFeedback {
  txHash: string;
  message: string;
  timestamp: string;
}

function loadFeedbacks(): StoredFeedback[] {
  if (!existsSync(feedbacksPath)) return [];
  try { return JSON.parse(readFileSync(feedbacksPath, 'utf-8')); }
  catch { return []; }
}

function saveFeedback(txHash: string, message: string): void {
  const list = loadFeedbacks();
  list.push({ txHash, message, timestamp: new Date().toISOString() });
  writeFileSync(feedbacksPath, JSON.stringify(list, null, 2));
}

globalThis.WebSocket = WebSocket;

const PRIVATE_STATE_ID = 'whistleblowerPrivateState';

const { network, config: networkConfig } = resolveNetwork();
const SEED = getOrCreateSeed(network);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const zkConfigPath = path.resolve(__dirname, '..', 'contract', 'src', 'managed', 'whistleblower');

const contractPath = path.join(zkConfigPath, 'contract', 'index.js');

if (!fs.existsSync(contractPath)) {
  console.error('\n❌ Contract not compiled! Run: npm run compact\n');
  process.exit(1);
}

const Whistleblower = await import(pathToFileURL(contractPath).href);
const contractIndexPath = path.resolve(__dirname, '..', 'contract', 'src', 'index.ts');
const { CompiledWhistleblowerContractContract, createWhistleblowerPrivateState } = await import(pathToFileURL(contractIndexPath).href);

async function createProviders(walletCtx: any) {
  const privateStatePassword = process.env.PRIVATE_STATE_PASSWORD?.trim() || 'Local-Devnet-Development-Placeholder-1';

  const walletProvider = {
    getCoinPublicKey: () => walletCtx.shieldedSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => walletCtx.shieldedSecretKeys.encryptionPublicKey,
    async balanceTx(tx: any, ttl?: Date) {
      const recipe = await walletCtx.wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys: walletCtx.shieldedSecretKeys, dustSecretKey: walletCtx.dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      return walletCtx.wallet.finalizeRecipe(recipe);
    },
    submitTx: (tx: any) => walletCtx.wallet.submitTransaction(tx) as any,
  };

  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  const accountId = walletCtx.unshieldedKeystore.getBech32Address().toString();

  return {
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
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║         ZK-Whistleblower Protocol — CLI                    ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const rl = createInterface({ input: stdin, output: stdout });

  const deployment = getDeployment(network);

  if (!deployment) {
    console.error(`No deploy on file for network ${network}. Run \`npm run setup -- --network ${network}\` first.`);
    process.exit(1);
  }
  const state = loadState();
  const authSecret = deployment.authSecret || state?.deployments?.[network]?.whistleblower?.authSecret;
  if (!authSecret) {
    console.error('  ❌ No auth secret found. Redeploy the contract.\n');
    process.exit(1);
  }

  console.log(`  Contract: ${deployment.address}`);
  console.log(`  Network: ${network}\n`);

  try {
    const seed = SEED;

    console.log('  Connecting to wallet...');
    const walletCtx = await createWallet({ network, networkConfig, seed });
    const restoredCount = Object.values(walletCtx.restored).filter(Boolean).length;
    if (restoredCount > 0) {
      console.log(`  Restored ${restoredCount}/3 child wallets from .midnight-wallet-state — sync will resume from saved point.`);
    }

    console.log('  Syncing with network...');
    console.log('  ℹ  This may take several minutes depending on network size.');
    console.log('     RPC disconnection messages during sync are normal and can be safely ignored.\n');
    const syncStart = Date.now();
    const syncInterval = setInterval(() => {
      const elapsed = Math.round((Date.now() - syncStart) / 1000);
      process.stdout.write(`\r  ⏳ Still syncing... (${elapsed}s elapsed)   `);
    }, 5000);
    const state = await walletCtx.wallet.waitForSyncedState();
    clearInterval(syncInterval);
    process.stdout.write('\r  ✓ Synced with network.                                      \n');

    await persistWalletState(network, walletCtx);
    const balance = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
    console.log(`  Balance: ${balance.toLocaleString()} tNight\n`);

    if (balance === 0n && network !== 'undeployed' && networkConfig.faucet) {
      const address = walletCtx.unshieldedKeystore.getBech32Address();
      console.log('  ⚠ Wallet has no tNight. Fund it from the faucet to send transactions:');
      console.log(`     ${networkConfig.faucet}`);
      console.log(`     Wallet address: ${address}\n`);
    }

    console.log('  Connecting to contract...');
    const providers = await createProviders(walletCtx);

    const deployed: any = await findDeployedContract(providers, {
      compiledContract: CompiledWhistleblowerContractContract as any,
      contractAddress: deployment.address,
      privateStateId: PRIVATE_STATE_ID,
      initialPrivateState: createWhistleblowerPrivateState(),
    });

    console.log('  ✅ Connected!\n');

    let running = true;
    while (running) {
      console.log('─── Menu ───────────────────────────────────────────────────────');
      console.log('  1. Submit feedback');
      console.log('  2. View all feedbacks');
      console.log('  3. Check wallet balance');
      console.log('  4. Check authorization status');
      console.log('  0. Exit\n');

      const choice = await rl.question('  Your choice: ');

      switch (choice.trim()) {
        case '1': {
          const feedback = await rl.question('  Enter your feedback: ');
          console.log('\n  Generating ZK proof and submitting (this may take 30-60 seconds)...');
          try {
            const credHash = crypto.createHash('sha256').update(authSecret).digest();
            const tx = await deployed.callTx.submitFeedback(feedback.trim(), credHash);
            saveFeedback(tx.public.txHash, feedback.trim());
            console.log(`\n  ✅ Feedback submitted successfully!`);
            console.log(`  Transaction ID: ${tx.public.txHash}`);
            console.log(`  Block height: ${tx.public.blockHeight}`);
            console.log(`  Verified: https://explorer.preview.midnight.network/tx/${tx.public.txHash}\n`);
          } catch (error) {
            console.error('\n  ❌ Failed:', error instanceof Error ? error.message : error);
          }
          break;
        }

        case '2': {
          const stored = loadFeedbacks();
          const contractState = await providers.publicDataProvider.queryContractState(deployment.address);
          const ledgerState = contractState ? Whistleblower.ledger(contractState.data) : null;
          const chainCount = ledgerState ? Number(ledgerState.feedbackCount) : 0;
          const authHex = ledgerState ? Buffer.from(ledgerState.authorizationSecret).toString('hex').slice(0, 16) : '?';
          console.log(`\n  On-chain count: ${chainCount}  |  Auth secret hash: ${authHex}...  |  Stored locally: ${stored.length}\n`);
          if (stored.length === 0) {
            console.log('  No feedbacks yet.\n');
          } else {
            stored.forEach((fb, i) => {
              console.log(`  [${i + 1}] ${fb.message}`);
              console.log(`       Tx: ${fb.txHash}`);
              console.log(`       At: ${new Date(fb.timestamp).toLocaleString()}`);
              console.log(`       Verify: https://explorer.preview.midnight.network/tx/${fb.txHash}`);
              console.log('');
            });
          }
          break;
        }

        case '3': {
          console.log('\n  Checking balance...');
          const currentState = await walletCtx.wallet.waitForSyncedState();
          const currentBalance = currentState.unshielded.balances[unshieldedToken().raw] ?? 0n;
          const dustBalance = currentState.dust.balance(new Date());
          console.log(`\n  tNight: ${currentBalance.toLocaleString()}`);
          console.log(`  DUST: ${dustBalance.toLocaleString()}\n`);
          break;
        }

        case '4': {
          const contractState = await providers.publicDataProvider.queryContractState(deployment.address);
          if (contractState) {
            const ledgerState = Whistleblower.ledger(contractState.data);
            const authHex = Buffer.from(ledgerState.authorizationSecret).toString('hex');
            const secretPreview = authSecret.length > 8 ? `${authSecret.slice(0, 8)}...${authSecret.slice(-4)}` : authSecret;
            console.log(`\n  Auth secret: ${secretPreview}`);
            console.log(`  Auth hash (on-chain): ${authHex.slice(0, 16)}...`);
            console.log(`  Authorization: Wallet connects → credential auto-injected → circuit validates → ZK proof generated\n`);
          }
          break;
        }

        case '0':
          running = false;
          console.log('\n  Goodbye!\n');
          break;

        default:
          console.log('\n  Invalid choice. Please enter 0-4.\n');
      }
    }

    await persistWalletState(network, walletCtx);
    await walletCtx.wallet.stop();
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
  } finally {
    rl.close();
  }
}

main().catch(console.error);
