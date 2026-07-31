import { type MidnightProviders } from "@midnight-ntwrk/midnight-js-types";
import { type FoundContract } from "@midnight-ntwrk/midnight-js-contracts";
import type {
  WranglerPrivateState,
  Contract,
} from "../../contract/src/index.js";

export const wranglerPrivateStateKey = "wranglerPrivateState";
export type PrivateStateId = typeof wranglerPrivateStateKey;

export type PrivateStates = {
  readonly wranglerPrivateState: WranglerPrivateState;
};

export type WranglerContract = Contract<
  WranglerPrivateState,
  Record<string, never>
>;

export type WranglerCircuitKeys = Exclude<
  keyof WranglerContract["impureCircuits"],
  number | symbol
>;

export type WranglerProviders = MidnightProviders<
  WranglerCircuitKeys,
  PrivateStateId,
  WranglerPrivateState
>;

export type DeployedWranglerContract = FoundContract<WranglerContract>;

export type WranglerDerivedState = {
  readonly feedbackCount: bigint;
  readonly authorizationSecret: Uint8Array;
};
