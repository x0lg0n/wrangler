import { type ContractAddress } from "@midnight-ntwrk/midnight-js-protocol/compact-runtime";
import { type Logger } from "pino";
import { type WhistleblowerDerivedState, type WhistleblowerProviders, type DeployedWhistleblowerContract } from "./common-types.js";
import { type Observable } from "rxjs";
export interface DeployedWhistleblowerAPI {
    readonly deployedContractAddress: ContractAddress;
    readonly state$: Observable<WhistleblowerDerivedState>;
    submitFeedback: (credential: bigint, feedback: string) => Promise<void>;
    getFeedbacks: () => Promise<{
        feedbackCount: bigint;
        nullifierCount: bigint;
        sequence: bigint;
    }>;
}
export declare class WhistleblowerAPI implements DeployedWhistleblowerAPI {
    readonly deployedContract: DeployedWhistleblowerContract;
    private readonly providers;
    private readonly logger?;
    private constructor();
    readonly deployedContractAddress: ContractAddress;
    readonly state$: Observable<WhistleblowerDerivedState>;
    submitFeedback(credential: bigint, feedback: string): Promise<void>;
    getFeedbacks(): Promise<{
        feedbackCount: bigint;
        nullifierCount: bigint;
        sequence: bigint;
    }>;
    static deploy(providers: WhistleblowerProviders, logger?: Logger): Promise<WhistleblowerAPI>;
    static join(providers: WhistleblowerProviders, contractAddress: ContractAddress, logger?: Logger): Promise<WhistleblowerAPI>;
    private static getPrivateState;
}
export * as utils from "./utils/index.js";
export * from "./common-types.js";
//# sourceMappingURL=index.d.ts.map