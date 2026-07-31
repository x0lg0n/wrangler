# Architecture

## Overview

The Midnight Wrangler Protocol uses a **three-tier architecture**:

1. **Compact Smart Contract** — On-chain ZK circuits
2. **TypeScript API Layer** — Contract interaction, deployment, state observation
3. **Client Interfaces** — CLI and web UI

## Data Flow

```
┌──────────────┐     ┌──────────────────┐     ┌────────────────┐     ┌──────────────┐
│  User Input  │────▶│  API Layer       │────▶│  Proof Server  │────▶│  Midnight    │
│  (credential │     │  (api/src/)      │     │  (Docker)      │     │  Node        │
│   + feedback)│     │  constructs tx   │     │  generates ZK  │     │  verifies    │
└──────────────┘     └──────────────────┘     │  proof         │     │  + records   │
                                              └────────────────┘     └──────────────┘
```

## Key Components

### Contract Layer (`contract/`)
- `wrangler.compact` — Compact source defining 3 circuits
- `witnesses.ts` — Private state type and factory
- `index.ts` — TypeScript wrapper with `CompiledContract.make().pipe(withVacantWitnesses)`
- `managed/` — Compiled output: `.zkir` (circuit IR), `.prover`/`.verifier` (keys)

### API Layer (`api/src/`)
- `common-types.ts` — `WranglerProviders`, `WranglerDerivedState`, contract types
- `index.ts` — `WranglerAPI` class with `deploy()`, `join()`, `submitFeedback()`, `getFeedbacks()`
- `utils/index.ts` — `randomBytes`, `toHex`

### Deployment Layer (`src/`)
- `network.ts` — State machine managing multi-network config, wallet seeds, deployment records
- `wallet.ts` — Wallet lifecycle (create, sync, stop) with shielded keystore
- `deploy.ts` — Contract deployment with DUST generation and retry logic
- `setup.ts` — Full orchestrator: Docker compose → compact → deploy
- `cli.ts` — Interactive feedback submission with live state subscription

## Privacy Architecture

### What stays private
- Authorization credential (never leaves the user's machine)
- Wallet identity during circuit execution

### What goes on-chain
- Feedback metadata: `feedbackCount`, `nullifierCount`, `sequence`
- Nullifier hashes (deterministic but non-reversible)

### ZK Proof Structure
1. `isAuthorized` circuit proves credential knowledge
2. `generateNullifier` creates a unique hash per credential+round
3. `submitFeedback` composes both circuits atomically
