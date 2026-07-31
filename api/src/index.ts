import * as crypto from "node:crypto";
import * as Whistleblower from "../../contract/src/managed/whistleblower/contract/index.js";

import { type ContractAddress } from "@midnight-ntwrk/midnight-js-protocol/compact-runtime";
import { type Logger } from "pino";
import {
  type WhistleblowerDerivedState,
  type WhistleblowerContract,
  type WhistleblowerProviders,
  type DeployedWhistleblowerContract,
  whistleblowerPrivateStateKey,
} from "./common-types.js";
import { CompiledWhistleblowerContractContract } from "../../contract/src/index";
import {
  deployContract,
  findDeployedContract,
} from "@midnight-ntwrk/midnight-js-contracts";
import { map, tap, type Observable } from "rxjs";
import {
  createWhistleblowerPrivateState,
  type WhistleblowerPrivateState,
} from "../../contract/src/witnesses.js";

export interface DeployedWhistleblowerAPI {
  readonly deployedContractAddress: ContractAddress;
  readonly state$: Observable<WhistleblowerDerivedState>;

  submitFeedback: (
    feedback: string,
    credential: string,
  ) => Promise<{ txHash: string; blockHeight: bigint }>;
  getFeedbackCount: () => Promise<bigint>;
}

export class WhistleblowerAPI implements DeployedWhistleblowerAPI {
  private constructor(
    public readonly deployedContract: DeployedWhistleblowerContract,
    private readonly providers: WhistleblowerProviders,
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
          const ledgerState = Whistleblower.ledger(contractState.data);
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

  readonly state$: Observable<WhistleblowerDerivedState>;

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
    const ledgerState = Whistleblower.ledger(contractState.data);
    return ledgerState.feedbackCount;
  }

  static async deploy(
    providers: WhistleblowerProviders,
    logger?: Logger,
  ): Promise<WhistleblowerAPI> {
    logger?.info("deployContract");

    const deployedContract = await deployContract(providers, {
      compiledContract: CompiledWhistleblowerContractContract,
      privateStateId: whistleblowerPrivateStateKey,
      initialPrivateState: createWhistleblowerPrivateState(),
    });

    logger?.trace({
      contractDeployed: {
        finalizedDeployTxData: deployedContract.deployTxData.public,
      },
    });

    return new WhistleblowerAPI(deployedContract, providers, logger);
  }

  static async join(
    providers: WhistleblowerProviders,
    contractAddress: ContractAddress,
    logger?: Logger,
  ): Promise<WhistleblowerAPI> {
    logger?.info({ joinContract: { contractAddress } });

    const deployedContract = await findDeployedContract<WhistleblowerContract>(
      providers,
      {
        contractAddress,
        compiledContract: CompiledWhistleblowerContractContract,
        privateStateId: whistleblowerPrivateStateKey,
        initialPrivateState: await WhistleblowerAPI.getPrivateState(
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

    return new WhistleblowerAPI(deployedContract, providers, logger);
  }

  private static async getPrivateState(
    providers: WhistleblowerProviders,
    contractAddress: ContractAddress,
  ): Promise<WhistleblowerPrivateState> {
    providers.privateStateProvider.setContractAddress(contractAddress);
    const existingPrivateState = await providers.privateStateProvider.get(
      whistleblowerPrivateStateKey,
    );
    return existingPrivateState ?? createWhistleblowerPrivateState();
  }
}

export * from "./common-types.js";
