# ZK-Verified Whistleblower & Feedback Protocol

[![Compact Compiler](https://img.shields.io/badge/Compact-0.31.0-1abc9c.svg)](https://midnight.network/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Apache_2.0-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D24.11.1-339933.svg)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/tests-10/10-passing-brightgreen)](https://github.com/x0lg0n/wrangler/actions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](CONTRIBUTING.md)

> **Midnight Challenge — Level 1: New Moon** · Anonymous, ZK-verified feedback on the Midnight Network

---

## 📋 Product Idea

An anonymous, ZK-verifiable feedback platform for DAOs, enterprises, and journalism. Organizations publish on-chain credential roots, and verified stakeholders submit feedback without revealing their identity — not even their wallet address. The system guarantees every piece of feedback came from a legitimate stakeholder (via ZK proof), prevents double submissions (via cryptographic nullifiers), and publishes everything on the Midnight ledger for transparent, tamper-proof records. Unlike centralized alternatives (Blind, AllVoices), this protocol requires zero trust in a third party — mathematical proofs replace promises.

## 🚀 Quick Start

```bash
git clone https://github.com/x0lg0n/wrangler.git
cd wrangler
pnpm install
pnpm run build
pnpm run setup       # local devnet
pnpm run cli         # interactive CLI (credential: 0)
```

## 📸 Screenshots

| Compile Output | Contract Deployment |
|:---:|:---:|
| ![compile](./screenshots/compile-output.png) | ![deploy](./screenshots/contract-deploy.png) |
| `pnpm run compact` — 2 circuits compiled | `pnpm run deploy` — contract address |

## 🧠 Overview

Organizations struggle to gather honest, critical feedback due to fear of retaliation. This protocol provides a **trustless solution** using Zero-Knowledge Proofs to mathematically prove that a user holds valid authorization credentials — without revealing those credentials or the user's wallet address to the network.

### Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   User CLI   │────▶│  Proof Server    │────▶│  Midnight Node  │
│  (credential │     │  (Docker)        │     │  (ledger)       │
│   + feedback)│     │  ZK proof gen    │     │  proof verify   │
└──────────────┘     └──────────────────┘     └─────────────────┘
                            │                        │
                            ▼                        ▼
                     ┌──────────────────┐     ┌─────────────────┐
                     │  Private State   │     │  Public Ledger  │
                     │  (credential)    │     │  feedbackCount  │
                     │  never exposed   │     │  nullifierCount │
                     └──────────────────┘     │  sequence       │
                                              └─────────────────┘
```

## 🔐 Privacy Model: Public State vs Private Witness

The protocol operates across three tiers of data visibility:

| Tier | Data | Visibility | Cryptographic Guarantee |
|------|------|------------|------------------------|
| **Public Ledger** | `feedbackCount`, `nullifierCount`, `sequence`, `owner` | Everyone (on-chain) | Integrity via chain consensus |
| **Public Input** | `inputCredential` (field element) | Circuit input | ZK proof binds input to witness |
| **Private Witness** | Raw credential value | User's machine only | Never transmitted or stored on-chain |

The `isAuthorized` circuit proves `inputCredential == authorizationSecret` on-chain without ever revealing the credential. The `generateNullifier` circuit creates a deterministic public hash from the private credential — this hash prevents double-submission but cannot be reversed to identify the submitter.

## 📁 Project Structure

```
wrangler/
├── contract/               # Compact smart contract
│   ├── src/
│   │   ├── whistleblower.compact  # Contract source (3 circuits)
│   │   ├── index.ts               # TypeScript contract entry
│   │   ├── witnesses.ts           # Private state helpers
│   │   └── managed/               # Compiled ZK circuits + proving keys
│   └── dist/                      # TypeScript build output
├── api/                    # Contract deployment & interaction API
│   └── src/
│       ├── index.ts              # API implementation
│       ├── common-types.ts       # Provider & state types
│       └── utils/                # Hex encoding, random bytes
├── cli/                    # Interactive CLI
│   ├── src/index.ts
│   ├── config.ts
│   └── midnight-wallet-provider.ts
├── ui/                     # React + Vite web interface (WIP)
│   └── src/App.tsx
├── src/                    # Production deployment scripts
│   ├── deploy.ts           # Contract deployer
│   ├── setup.ts            # Docker + compile + deploy orchestrator
│   ├── cli.ts              # Runtime CLI with full wallet
│   ├── network.ts          # Multi-network config manager
│   ├── wallet.ts           # Wallet creation & lifecycle
│   └── wallet-state.ts     # Persistent wallet state
├── tests/                  # Vitest test suite
│   └── contract.test.ts    # 10 tests
├── screenshots/            # Submission screenshots
├── docker-compose.yml      # Devnet services
└── docs/                   # Documentation
    ├── ARCHITECTURE.md
    └── DEVELOPMENT.md
```

## ⚙️ Smart Contract

The contract is written in [Compact](https://midnight.network/developers) — Midnight's ZK-smart contract language.

### Circuits

| Circuit | Type | Rows | Purpose |
|---------|------|------|---------|
| `isAuthorized` | Proof | 51 | Verifies `inputCredential == authorizationSecret` |
| `generateNullifier` | Pure | — | Deterministic hash: `persistentHash([credential, seq])` |
| `submitFeedback` | Composite | 4632 | Authorizes → nullifies → increments counters |

### Ledger State

```
feedbackCount:    Uint<16>        — total submissions
nullifierCount:   Uint<16>        — unique submitters
owner:            Bytes<32>       — deployer identity
authorizationSecret: Field        — authorized credential
sequence:         Counter         — monotonic nullifier seed
```

## 📋 Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | >= 24.11.1 | [nodejs.org](https://nodejs.org/) |
| pnpm | >= 9 | `npm install -g pnpm` |
| Docker | Latest | [docker.com](https://docker.com/) |
| compactc | 0.31.0 | [Midnight SDK](https://midnight.network/developers) |

## 🔧 Setup

### Local Devnet

```bash
# Install dependencies
pnpm install

# Compile Compact contract
pnpm run compact

# Build TypeScript packages
pnpm run build

# Start Docker services + deploy
pnpm run setup

# Run interactive CLI (credential: 0)
pnpm run cli
```

### Preprod Network

```bash
# Switch network
pnpm run network preprod

# Start only the proof server (devnet not needed)
docker compose up -d proof-server

# Deploy (auto-waits for faucet funding)
pnpm run deploy --network preprod
```

### Troubleshooting

**Deploy stuck on "Waiting for faucet..."**
→ Manually request tNIGHT at the [Preprod Faucet](https://midnight-tmnight-preprod.nethermind.dev/)
→ Set shorter timeout: `MIDNIGHT_FAUCET_TIMEOUT_MS=300000 pnpm run deploy --network preprod`

**Port conflicts**
→ `docker compose down` then retry
→ Check: `ss -tlnp | grep -E '6300|8088|9944'`

## 🧪 Tests

```bash
pnpm run test
```

10 tests covering:
- Contract compilation artifacts (managed directory, circuit keys, source integrity)
- Private state creation and credential isolation
- API type exports and module resolution

## 🌐 Networks

| Network | Indexer | Faucet | Proof Server |
|---------|---------|--------|-------------|
| Local | `http://127.0.0.1:8088` | N/A | Local Docker |
| Preview | `https://indexer.preview.midnight.network` | [Faucet](https://midnight-tmnight-preview.nethermind.dev/) | Local Docker |
| Preprod | `https://indexer.preprod.midnight.network` | [Faucet](https://midnight-tmnight-preprod.nethermind.dev/) | Local Docker |

Switch: `pnpm run network <name>`

## 📦 Commands

| Command | Description |
|---------|-------------|
| `pnpm run compact` | Compile Compact → managed circuits + keys |
| `pnpm run build` | Build all TypeScript packages |
| `pnpm run test` | Run Vitest test suite |
| `pnpm run setup` | Docker + compact + build + deploy (all-in-one) |
| `pnpm run deploy` | Deploy contract to active network |
| `pnpm run cli` | Interactive CLI |
| `pnpm run check-balance` | Wallet balance |
| `pnpm run network` | Show/switch active network |
| `pnpm run clean` | Reset local state |

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 🛡️ Security

See [SECURITY.md](SECURITY.md) for vulnerability disclosure.

## 📄 License

Apache 2.0 — see [LICENSE](LICENSE).
