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
import * as utils from "./utils/index.js";
import { deployContract, findDeployedContract } from "@midnight-ntwrk/midnight-js-contracts";
import { map, tap, type Observable } from "rxjs";
import { WhistleblowerPrivateState, createWhistleblowerPrivateState } from "../../contract/src/witnesses.js";

export interface DeployedWhistleblowerAPI {
  readonly deployedContractAddress: ContractAddress;
  readonly state$: Observable<WhistleblowerDerivedState>;

  submitFeedback: (credential: bigint, feedback: string) => Promise<void>;
  getFeedbacks: () => Promise<{ feedbackCount: bigint; nullifierCount: bigint; sequence: bigint }>;
}

function bytesToBigint(bytes: Uint8Array): bigint {
  let result = 0n;
  for (const b of bytes) {
    result = (result << 8n) + BigInt(b);
  }
  return result;
}

export class WhistleblowerAPI implements DeployedWhistleblowerAPI {
  private constructor(
    public readonly deployedContract: DeployedWhistleblowerContract,
    private readonly providers: WhistleblowerProviders,
    private readonly logger?: Logger,
  ) {
    this.deployedContractAddress = deployedContract.deployTxData.public.contractAddress;
    providers.privateStateProvider.setContractAddress(this.deployedContractAddress);
    this.state$ = providers.publicDataProvider.contractStateObservable(this.deployedContractAddress, { type: "latest" }).pipe(
      map((contractState) => {
        const ledgerState = Whistleblower.ledger(contractState.data);
        return {
          feedbackCount: ledgerState.feedbackCount,
          nullifierCount: ledgerState.nullifierCount,
          sequence: ledgerState.sequence,
          owner: ledgerState.owner,
        };
      }),
      tap((state) =>
        logger?.trace({
          ledgerStateChanged: {
            feedbackCount: state.feedbackCount,
            nullifierCount: state.nullifierCount,
            sequence: state.sequence,
          },
        }),
      ),
    );
  }

  readonly deployedContractAddress: ContractAddress;

  readonly state$: Observable<WhistleblowerDerivedState>;

  async submitFeedback(credential: bigint, feedback: string): Promise<void> {
    this.logger?.info({ submittingFeedback: feedback.length }, "submittingFeedback");

    const txData = await this.deployedContract.callTx.submitFeedback(credential, feedback);

    this.logger?.trace({
      transactionAdded: {
        circuit: "submitFeedback",
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
  }

  async getFeedbacks(): Promise<{ feedbackCount: bigint; nullifierCount: bigint; sequence: bigint }> {
    const contractState = await this.providers.publicDataProvider.queryContractState(
      this.deployedContractAddress,
    );
    if (contractState === null) return { feedbackCount: 0n, nullifierCount: 0n, sequence: 0n };
    const ledgerState = Whistleblower.ledger(contractState.data);
    return {
      feedbackCount: ledgerState.feedbackCount,
      nullifierCount: ledgerState.nullifierCount,
      sequence: ledgerState.sequence,
    };
  }

  static async deploy(providers: WhistleblowerProviders, logger?: Logger): Promise<WhistleblowerAPI> {
    logger?.info("deployContract");

    const deployedContract = await deployContract(providers, {
      compiledContract: CompiledWhistleblowerContractContract,
      privateStateId: whistleblowerPrivateStateKey,
      initialPrivateState: createWhistleblowerPrivateState(bytesToBigint(utils.randomBytes(32))),
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

    const deployedContract = await findDeployedContract<WhistleblowerContract>(providers, {
      contractAddress,
      compiledContract: CompiledWhistleblowerContractContract,
      privateStateId: whistleblowerPrivateStateKey,
      initialPrivateState: await WhistleblowerAPI.getPrivateState(providers, contractAddress),
    });

    logger?.trace({
      contractJoined: {
        finalizedDeployTxData: deployedContract.deployTxData.public,
      },
    });

    return new WhistleblowerAPI(deployedContract, providers, logger);
  }

  private static async getPrivateState(
    providers: WhistleblowerProviders,
    contractAddress: ContractAddress,
  ): Promise<WhistleblowerPrivateState> {
    providers.privateStateProvider.setContractAddress(contractAddress);
    const existingPrivateState = await providers.privateStateProvider.get(whistleblowerPrivateStateKey);
    return existingPrivateState ?? createWhistleblowerPrivateState(bytesToBigint(utils.randomBytes(32)));
  }
}

export * as utils from "./utils/index.js";

export * from "./common-types.js";