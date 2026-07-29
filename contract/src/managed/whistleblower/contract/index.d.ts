import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
  isAuthorized(context: __compactRuntime.CircuitContext<PS>,
               inputCredential_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  submitFeedback(context: __compactRuntime.CircuitContext<PS>,
                 inputCredential_0: bigint,
                 feedback_0: string): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  isAuthorized(context: __compactRuntime.CircuitContext<PS>,
               inputCredential_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  submitFeedback(context: __compactRuntime.CircuitContext<PS>,
                 inputCredential_0: bigint,
                 feedback_0: string): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  generateNullifier(inputCredential_0: bigint, seq_0: bigint): Uint8Array;
}

export type Circuits<PS> = {
  isAuthorized(context: __compactRuntime.CircuitContext<PS>,
               inputCredential_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  generateNullifier(context: __compactRuntime.CircuitContext<PS>,
                    inputCredential_0: bigint,
                    seq_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  submitFeedback(context: __compactRuntime.CircuitContext<PS>,
                 inputCredential_0: bigint,
                 feedback_0: string): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly feedbackCount: bigint;
  readonly nullifierCount: bigint;
  readonly owner: Uint8Array;
  readonly sequence: bigint;
  readonly authorizationSecret: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
