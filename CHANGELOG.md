# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — 2026-07-29

### Added
- Compact smart contract: `isAuthorized`, `generateNullifier`, `submitFeedback` circuits
- TypeScript API for contract deployment, joining, and interaction
- Interactive CLI with credential-based feedback submission
- Deployment infrastructure: wallet, network config, setup orchestrator
- Docker compose for local devnet (node, indexer, proof server)
- Wallet state persistence across sessions
- Network switching: local devnet, preview, preprod

### Changed
- Forked from Midnight Network bulletin-board template; rewrote contract for anonymous feedback use case

### Security
- Authorization through ZK circuit verification (no on-chain identity exposure)
- Cryptographic nullifier for double-submission prevention
