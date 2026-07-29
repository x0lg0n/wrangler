import { CompiledContract } from "@midnight-ntwrk/midnight-js-protocol/compact-js";

export * from "./managed/whistleblower/contract/index.js";
export * from "./witnesses";

import * as CompiledWhistleblowerContract from "./managed/whistleblower/contract/index.js";

export const CompiledWhistleblowerContractContract = CompiledContract.make<
  CompiledWhistleblowerContract.Contract<{ credential: bigint }>
>("Whistleblower", CompiledWhistleblowerContract.Contract<{ credential: bigint }>).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets("./managed/whistleblower"),
);