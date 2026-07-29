import { type NetworkId } from "@midnight-ntwrk/midnight-js-network-id";

export class StandaloneConfig {
  readonly networkId: NetworkId = "local";
  readonly zkConfigPath = "./zk-config";
  readonly proofServer = "http://localhost:3000";
  readonly indexer = "http://localhost:3100";
  readonly indexerWS = "ws://localhost:3100/graphql";
  readonly node = "ws://localhost:3001";
}

export type Config = StandaloneConfig;