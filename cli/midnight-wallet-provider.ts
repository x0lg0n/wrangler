import type { WalletFacade } from "@midnight-ntwrk/wallet-sdk-facade";
import { type Logger } from "pino";

export class MidnightWalletProvider {
  readonly wallet: WalletFacade;

  private constructor(wallet: WalletFacade) {
    this.wallet = wallet;
  }

  static async build(
    logger: Logger,
    envConfiguration: Record<string, unknown>,
    seed: string,
  ): Promise<MidnightWalletProvider> {
    const { WalletFacade } = await import("@midnight-ntwrk/wallet-sdk-facade");
    const wallet = await WalletFacade.init({
      networkId: "local",
      indexerClientConnection: {
        indexerHttpUrl: (envConfiguration as Record<string, string>).indexer,
        indexerWsUrl: (envConfiguration as Record<string, string>).indexerWS,
      },
      provingServerUrl: new URL((envConfiguration as Record<string, string>).proofServer),
      txHistoryStorage: new (await import("@midnight-ntwrk/wallet-sdk")).NoOpTransactionHistoryStorage(),
      costParameters: { additionalFeeOverhead: 300_000_000_000_000n, feeBlocksMargin: 5 },
    });

    await wallet.start();

    logger.info("Wallet started");
    return new MidnightWalletProvider(wallet);
  }

  async start(): Promise<void> {
    // Wallet is already started in build()
  }

  async stop(): Promise<void> {
    await this.wallet.stop();
  }
}