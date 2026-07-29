# ZK-Verified Whistleblower & Feedback Protocol

A decentralized application (dApp) on the [Midnight Network](https://midnight.network/) that enables anonymous, mathematically verifiable feedback submission using Zero-Knowledge Proofs (ZKPs).

[![Compact Compiler](https://img.shields.io/badge/Compact-0.31.0-1abc9c.svg)](https://midnight.network/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D24.11.1-339933.svg)](https://nodejs.org/)

> **Midnight Challenge Submission — Level 1: New Moon**

---

## Product Idea

An anonymous, ZK-verifiable feedback platform for DAOs, enterprises, and journalism. Organizations publish on-chain credential roots, and verified stakeholders submit feedback without revealing their identity — not even their wallet address. The system guarantees every piece of feedback came from a legitimate stakeholder (via ZK proof), prevents double submissions (via cryptographic nullifiers), and publishes everything on the Midnight ledger for transparent, tamper-proof records. Unlike centralized alternatives (Blind, AllVoices), this protocol requires zero trust in a third party — mathematical proofs replace promises.

---

## Overview

Organizations struggle to gather honest, critical feedback due to fear of retaliation. This protocol provides a **trustless solution** using ZKPs to mathematically prove that a user holds valid authorization credentials — without revealing those credentials or the user's wallet address to the network.

### How It Works

```
User Action     →  Local Proof Generation     →  On-chain Verification
     │                       │                        │
     ▼                       ▼                        ▼
 Enter feedback     Proof Server generates      Midnight Node
 + credential       ZK proof of authorization   verifies proof
                    + nullifier                  → ledger updated
```

## Privacy Model: Public State vs Private Witness

The protocol splits data into three tiers:

| Tier | What | Visibility | Example |
|------|------|------------|---------|
| **Public Ledger** | `feedbackCount`, `nullifierCount`, `sequence`, `owner` | Everyone | Total submissions, unique submitters |
| **Public Input** | `inputCredential` (to circuit) | The circuit's public input | A hashed field element |
| **Private Witness** | The raw credential value | User's machine only | The actual authorization secret |

The `isAuthorized` circuit proves `inputCredential == authorizationSecret` on-chain without ever revealing the credential itself. The `generateNullifier` circuit creates a public hash (`Bytes<32>`) from the private credential — this hash is stored on-chain to prevent double-submission, but cannot be reversed to identify the submitter.

## Project Structure

```
whistleblower-protocol/
├── contract/               # Smart contract (Compact language)
│   ├── src/
│   │   ├── whistleblower.compact  # Contract source
│   │   ├── index.ts               # Contract entry
│   │   └── witnesses.ts           # Private state helpers
│   ├── src/managed/               # Compiled ZK circuits + keys
│   └── dist/                      # TypeScript build output
├── api/                    # Contract API (deploy/join/interact)
│   └── src/
│       ├── index.ts              # API implementation
│       ├── common-types.ts       # Type definitions
│       └── utils/                # Utilities
├── cli/                    # Interactive CLI
│   └── src/index.ts
├── ui/                     # React web interface (WIP)
├── src/                    # Deployment infrastructure
│   ├── deploy.ts           # Contract deployment
│   ├── setup.ts            # Docker + compile + deploy
│   ├── cli.ts              # Interactive CLI (tsx)
│   ├── network.ts          # Network config
│   ├── wallet.ts           # Wallet management
│   └── wallet-state.ts     # State persistence
├── tests/                  # Test suite
│   └── contract.test.ts
└── docker-compose.yml      # Local devnet services
```

## Smart Contract

The Compact contract (`contract/src/whistleblower.compact`) implements three circuits:

| Circuit | Type | Purpose |
|---------|------|---------|
| `isAuthorized` | Proof | Verifies the submitter holds a valid credential |
| `generateNullifier` | Pure | Creates a unique hash to prevent double-submission |
| `submitFeedback` | Composite | Authorizes, nullifies, and records feedback on-chain |

**Ledger state:**
- `feedbackCount` — total submissions
- `nullifierCount` — unique submitters
- `owner` — contract deployer identity
- `authorizationSecret` — the authorized credential hash
- `sequence` — monotonic counter for nullifier derivation

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | >= 24.11.1 | Runtime |
| pnpm | >= 9 | Package manager |
| Docker | Latest | Local devnet + proof server |
| compactc | 0.31.0 | Compact compiler |

## Setup Instructions

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd whistleblower-protocol
pnpm install
```

### 2. Compile the Contract

```bash
pnpm run compact
```

Expected output:
```
Compiling 2 circuits:
  circuit "isAuthorized" (k=6, rows=51)
  circuit "submitFeedback" (k=13, rows=4632)
```

### 3. Build TypeScript Packages

```bash
pnpm run build
```

### 4a. Local Devnet (Quick Start)

```bash
pnpm run setup
pnpm run cli
```

For local devnet, credential is `0`.

### 4b. Deploy to Preprod

```bash
pnpm run network preprod
docker compose up -d proof-server
pnpm run deploy --network preprod
```

The deploy script will generate a wallet, wait for faucet funds, and deploy the contract.

## Tests

```bash
pnpm run test
```

## Screenshots

### Compile Output

> [Insert screenshot of `pnpm run compact` showing both circuits compiled]

### Contract Deployed

> [Insert screenshot of `pnpm run deploy` showing contract address]

## CLI Usage

```
1. Submit feedback     — Enter credential + feedback text
2. View ledger state   — Read chain state (counts)
3. Exit               — Quit CLI
```

## Networks

| Network | Indexer | Faucet |
|---------|---------|--------|
| Local devnet | http://127.0.0.1:8088 | N/A |
| Preview | https://indexer.preview.midnight.network | [Faucet](https://midnight-tmnight-preview.nethermind.dev/) |
| Preprod | https://indexer.preprod.midnight.network | [Faucet](https://midnight-tmnight-preprod.nethermind.dev/) |

Switch networks:
```bash
pnpm run network preprod   # Switch to preprod
pnpm run network           # Show current network
```

## Commands

```bash
pnpm run compact              # Compile Compact contract
pnpm run build                # Build all packages
pnpm run setup                # Docker + compile + deploy
pnpm run deploy               # Deploy to current network
pnpm run cli                  # Interactive CLI
pnpm run check-balance        # Wallet balance
pnpm run network              # Show/set network
pnpm run test                 # Run tests
pnpm run proof-server:start   # Start proof server
pnpm run proof-server:stop    # Stop all services
pnpm run clean                # Reset local state
```

## Security

See [SECURITY.md](SECURITY.md) for vulnerability disclosure.

## License

Apache 2.0 — see [LICENSE](LICENSE).
