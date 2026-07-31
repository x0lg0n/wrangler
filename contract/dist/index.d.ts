import { CompiledContract } from "@midnight-ntwrk/midnight-js-protocol/compact-js";
export * from "./managed/whistleblower/contract/index.js";
export * from "./witnesses";
import * as CompiledWranglerContract from "./managed/whistleblower/contract/index.js";
export declare const CompiledWranglerContractContract: CompiledContract.CompiledContract<CompiledWranglerContract.Contract<Record<string, never>, CompiledWranglerContract.Witnesses<Record<string, never>>>, Record<string, never>, never>;
