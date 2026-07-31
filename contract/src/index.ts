import { CompiledContract } from "@midnight-ntwrk/midnight-js-protocol/compact-js";

export * from "./managed/whistleblower/contract/index.js";
export * from "./witnesses";

import * as CompiledWhistleblowerContract from "./managed/whistleblower/contract/index.js";

export const CompiledWhistleblowerContractContract = CompiledContract.make<
  CompiledWhistleblowerContract.Contract<Record<string, never>>
>(
  "Whistleblower",
  CompiledWhistleblowerContract.Contract<Record<string, never>>,
).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets("./managed/whistleblower"),
);
