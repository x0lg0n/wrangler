import { createInterface, type Interface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { randomBytes } from "node:crypto";
import { WebSocket } from "ws";
import { WhistleblowerAPI, type WhistleblowerProviders } from "../../api/src/index.js";
import { NodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import { type Logger } from "pino";

globalThis.WebSocket = WebSocket as unknown as typeof globalThis.WebSocket;

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");

interface EnvConfig {
  indexer: string;
  indexerWS: string;
  proofServer: string;
}

const deployOrJoin = async (
  providers: WhistleblowerProviders,
  rli: Interface,
  logger: Logger,
): Promise<WhistleblowerAPI | null> => {
  let api: WhistleblowerAPI | null = null;
  while (true) {
    const choice = await rli.question(
      "\nYou can do one of the following:\n  1. Deploy a new whistleblower contract\n  2. Join an existing whistleblower contract\n  3. Exit\nWhich would you like to do? ",
    );
    switch (choice) {
      case "1":
        api = await WhistleblowerAPI.deploy(providers, logger);
        logger.info(`Deployed contract at address: ${api.deployedContractAddress}`);
        return api;
      case "2":
        api = await WhistleblowerAPI.join(providers, await rli.question("What is the contract address (in hex)? "), logger);
        logger.info(`Joined contract at address: ${api.deployedContractAddress}`);
        return api;
      case "3":
        logger.info("Exiting...");
        return null;
      default:
        logger.error(`Invalid choice: ${choice}`);
    }
  }
};

const MAIN_LOOP_QUESTION = `
You can do one of the following:
  1. Submit feedback
  2. View ledger state
  3. Exit
Which would you like to do? `;

const mainLoop = async (providers: WhistleblowerProviders, rli: Interface, logger: Logger): Promise<void> => {
  const whistleblowerApi = await deployOrJoin(providers, rli, logger);
  if (whistleblowerApi === null) return;

  try {
    while (true) {
      const choice = await rli.question(MAIN_LOOP_QUESTION);
      try {
        switch (choice) {
          case "1": {
            const credentialStr = await rli.question("Enter your credential (as a decimal number): ");
            const credential = BigInt(credentialStr.trim());
            const feedback = await rli.question("Enter your feedback: ");
            console.log("\n  Submitting feedback (this may take 30-60 seconds)...");
            await whistleblowerApi.submitFeedback(credential, feedback);
            console.log("  Feedback submitted successfully!\n");
            break;
          }
          case "2": {
            const state = await whistleblowerApi.getFeedbacks();
            console.log(`\n  Ledger state:`);
            console.log(`    Feedback count: ${state.feedbackCount}`);
            console.log(`    Nullifier count: ${state.nullifierCount}`);
            console.log(`    Sequence: ${state.sequence}`);
            console.log("");
            break;
          }
          case "3":
            logger.info("Exiting...");
            return;
          default:
            logger.error(`Invalid choice: ${choice}`);
        }
      } catch (e) {
        logger.error(`Error: ${e instanceof Error ? e.message : String(e)}`);
        logger.info("Returning to main menu...");
      }
    }
  } finally {
    // cleanup
  }
};

export const run = async (config: { zkConfigPath: string }, logger: Logger): Promise<void> => {
  const rli = createInterface({ input, output, terminal: true });
  try {
    const seed = toHex(randomBytes(32));
    const providers = {
      privateStateProvider: levelPrivateStateProvider({
        privateStateStoreName: "whistleblower-state",
        signingKeyStoreName: "whistleblower-signing-keys",
        privateStoragePasswordProvider: () => "Whistleblower-Test-2026!",
        accountId: seed,
      }),
      publicDataProvider: indexerPublicDataProvider("http://127.0.0.1:8088/api/v1/graphql", "ws://127.0.0.1:8088/ws"),
      zkConfigProvider: new NodeZkConfigProvider(config.zkConfigPath),
      proofProvider: httpClientProofProvider("http://127.0.0.1:6300", new NodeZkConfigProvider(config.zkConfigPath)),
      walletProvider: null as unknown as WhistleblowerProviders["walletProvider"],
      midnightProvider: null as unknown as WhistleblowerProviders["midnightProvider"],
    } as WhistleblowerProviders;
    await mainLoop(providers, rli, logger);
  } catch (e) {
    logger.error(`Found error '${e instanceof Error ? e.message : String(e)}'`);
    logger.info("Exiting...");
  } finally {
    rli.close();
    rli.removeAllListeners();
  }
};