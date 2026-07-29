import { type MidnightProviders } from "@midnight-ntwrk/midnight-js-types";
import { type FoundContract } from "@midnight-ntwrk/midnight-js-contracts";
import type { WhistleblowerPrivateState, Contract } from "../../contract/src/index.js";
export declare const whistleblowerPrivateStateKey = "whistleblowerPrivateState";
export type PrivateStateId = typeof whistleblowerPrivateStateKey;
export type PrivateStates = {
    readonly whistleblowerPrivateState: WhistleblowerPrivateState;
};
export type WhistleblowerContract = Contract<WhistleblowerPrivateState, Record<string, never>>;
export type WhistleblowerCircuitKeys = Exclude<keyof WhistleblowerContract["impureCircuits"], number | symbol>;
export type WhistleblowerProviders = MidnightProviders<WhistleblowerCircuitKeys, PrivateStateId, WhistleblowerPrivateState>;
export type DeployedWhistleblowerContract = FoundContract<WhistleblowerContract>;
export type WhistleblowerDerivedState = {
    readonly feedbackCount: bigint;
    readonly nullifierCount: bigint;
    readonly sequence: bigint;
    readonly owner: Uint8Array;
};
//# sourceMappingURL=common-types.d.ts.map