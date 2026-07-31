import { CompiledContract } from "@midnight-ntwrk/midnight-js-protocol/compact-js";

export * from "./managed/whistleblower/contract/index.js";
export * from "./witnesses";

import * as CompiledWranglerContract from "./managed/whistleblower/contract/index.js";

export const CompiledWranglerContractContract = CompiledContract.make<
  CompiledWranglerContract.Contract<Record<string, never>>
>(
  "Whistleblower",
  CompiledWranglerContract.Contract<Record<string, never>>,
).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets("./managed/whistleblower"),
);
