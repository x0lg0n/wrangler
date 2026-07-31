import * as crypto from "node:crypto";
import * as Wrangler from "../../contract/src/managed/whistleblower/contract/index.js";

import { type ContractAddress } from "@midnight-ntwrk/midnight-js-protocol/compact-runtime";
import { type Logger } from "pino";
import {
  type WranglerDerivedState,
  type WranglerContract,
  type WranglerProviders,
  type DeployedWranglerContract,
  wranglerPrivateStateKey,
} from "./common-types.js";
import { CompiledWranglerContractContract } from "../../contract/src/index";
import {
  deployContract,
  findDeployedContract,
} from "@midnight-ntwrk/midnight-js-contracts";
import { map, tap, type Observable } from "rxjs";
import {
  createWranglerPrivateState,
  type WranglerPrivateState,
} from "../../contract/src/witnesses.js";

export interface DeployedWranglerAPI {
  readonly deployedContractAddress: ContractAddress;
  readonly state$: Observable<WranglerDerivedState>;

  submitFeedback: (
    feedback: string,
    credential: string,
  ) => Promise<{ txHash: string; blockHeight: bigint }>;
  getFeedbackCount: () => Promise<bigint>;
}

export class WranglerAPI implements DeployedWranglerAPI {
  private constructor(
    public readonly deployedContract: DeployedWranglerContract,
    private readonly providers: WranglerProviders,
    private readonly logger?: Logger,
  ) {
    this.deployedContractAddress =
      deployedContract.deployTxData.public.contractAddress;
    providers.privateStateProvider.setContractAddress(
      this.deployedContractAddress,
    );
    this.state$ = providers.publicDataProvider
      .contractStateObservable(this.deployedContractAddress, { type: "latest" })
      .pipe(
        map((contractState) => {
          const ledgerState = Wrangler.ledger(contractState.data);
          return {
            feedbackCount: ledgerState.feedbackCount,
            authorizationSecret: ledgerState.authorizationSecret,
          };
        }),
        tap((state) =>
          logger?.trace({
            ledgerStateChanged: { feedbackCount: state.feedbackCount },
          }),
        ),
      );
  }

  readonly deployedContractAddress: ContractAddress;

  readonly state$: Observable<WranglerDerivedState>;

  async submitFeedback(
    feedback: string,
    credential: string,
  ): Promise<{ txHash: string; blockHeight: bigint }> {
    this.logger?.info(
      { submittingFeedback: feedback.length },
      "submittingFeedback",
    );

    const credHash = crypto.createHash("sha256").update(credential).digest();
    const txData = await this.deployedContract.callTx.submitFeedback(
      feedback,
      credHash,
    );

    this.logger?.trace({
      transactionAdded: {
        circuit: "submitFeedback",
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });

    return {
      txHash: txData.public.txHash,
      blockHeight: BigInt(txData.public.blockHeight),
    };
  }

  async getFeedbackCount(): Promise<bigint> {
    const contractState =
      await this.providers.publicDataProvider.queryContractState(
        this.deployedContractAddress,
      );
    if (contractState === null) return 0n;
    const ledgerState = Wrangler.ledger(contractState.data);
    return ledgerState.feedbackCount;
  }

  static async deploy(
    providers: WranglerProviders,
    logger?: Logger,
  ): Promise<WranglerAPI> {
    logger?.info("deployContract");

    const deployedContract = await deployContract(providers, {
      compiledContract: CompiledWranglerContractContract,
      privateStateId: wranglerPrivateStateKey,
      initialPrivateState: createWranglerPrivateState(),
    });

    logger?.trace({
      contractDeployed: {
        finalizedDeployTxData: deployedContract.deployTxData.public,
      },
    });

    return new WranglerAPI(deployedContract, providers, logger);
  }

  static async join(
    providers: WranglerProviders,
    contractAddress: ContractAddress,
    logger?: Logger,
  ): Promise<WranglerAPI> {
    logger?.info({ joinContract: { contractAddress } });

    const deployedContract = await findDeployedContract<WranglerContract>(
      providers,
      {
        contractAddress,
        compiledContract: CompiledWranglerContractContract,
        privateStateId: wranglerPrivateStateKey,
        initialPrivateState: await WranglerAPI.getPrivateState(
          providers,
          contractAddress,
        ),
      },
    );

    logger?.trace({
      contractJoined: {
        finalizedDeployTxData:
          deployedContract.deployTxData.public.contractAddress,
      },
    });

    return new WranglerAPI(deployedContract, providers, logger);
  }

  private static async getPrivateState(
    providers: WranglerProviders,
    contractAddress: ContractAddress,
  ): Promise<WranglerPrivateState> {
    providers.privateStateProvider.setContractAddress(contractAddress);
    const existingPrivateState = await providers.privateStateProvider.get(
      wranglerPrivateStateKey,
    );
    return existingPrivateState ?? createWranglerPrivateState();
  }
}

export * from "./common-types.js";
