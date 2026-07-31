import { CompiledContract } from "@midnight-ntwrk/midnight-js-protocol/compact-js";
export * from "./managed/whistleblower/contract/index.js";
export * from "./witnesses";
import * as CompiledWhistleblowerContract from "./managed/whistleblower/contract/index.js";
export declare const CompiledWhistleblowerContractContract: CompiledContract.CompiledContract<CompiledWhistleblowerContract.Contract<Record<string, never>, CompiledWhistleblowerContract.Witnesses<Record<string, never>>>, Record<string, never>, never>;
