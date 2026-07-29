import { Ledger } from "./managed/whistleblower/contract/index.js";

export type WhistleblowerPrivateState = {
  readonly credential: bigint;
};

export const createWhistleblowerPrivateState = (credential: bigint) => ({
  credential,
});