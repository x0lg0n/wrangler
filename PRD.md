Product Requirements Document (PRD)

Project Title: ZK-Verified Whistleblower & Feedback Protocol

1. Executive Summary

The ZK-Verified Whistleblower & Feedback Protocol is a decentralized application (dApp) built on the Midnight Network. It aims to solve the enterprise "Transparency Paradox" by enabling pre-authorized stakeholders (e.g., employees, DAO members, or citizens) to submit anonymous but mathematically verifiable feedback. By utilizing Zero-Knowledge Proofs (ZKPs) via Midnight's Compact language, the protocol guarantees that only legitimate members can post, prevents spam/duplicate submissions through cryptographic nullifiers, and entirely obfuscates the submitter's identity from the public ledger.

2. Problem Statement

Organizations struggle to gather honest, critical feedback due to fear of retaliation.

Traditional Systems: Are centralized and require users to trust the IT department or a third-party vendor to maintain their anonymity.

Public Blockchains: Are fully transparent, meaning any transaction can be traced back to the sender's wallet address, exposing the whistleblower.

Fully Anonymous Systems (No Auth): Are susceptible to spam, bot attacks, and manipulation by external malicious actors.

3. Solution & Value Proposition

This protocol provides a trustless solution. It uses ZKPs to mathematically prove that a user holds the correct authorization credentials without revealing those credentials or the user's wallet address to the network.

For Organizations: Guarantees that 100% of the feedback on the public ledger originated from verified stakeholders.

For Submitters: Provides absolute, mathematically guaranteed anonymity, removing the need to "trust" the organization.

4. Core Features & Capabilities

4.1. The Public Ledger (State)

Feedback Array: A public, append-only data structure storing the text of the submitted feedback.

Nullifier Set: A public, append-only list of cryptographic hashes used to track who has already submitted feedback, preventing double-voting/spam without revealing the original identity.

4.2. The Private Witness (User Identity)

Authorization Credential: The user's secret (e.g., a hash of an Employee ID or a specific token) held locally in their wallet. This data never leaves the user's local machine.

4.3. The Zero-Knowledge Circuit

Membership Verification: Locally asserts that the provided Private Witness exists within the authorized group (e.g., checking against a Merkle Root or a specific access code).

Nullifier Generation: Computes a unique, deterministic hash based on the Private Witness and the specific survey/feedback round.

Double-Spend Prevention: Asserts that the generated Nullifier does not already exist in the public Nullifier Set.

Selective Disclosure: Uses the disclose() function to explicitly publish only the feedback text and the nullifier hash to the network.

5. Technical Architecture & Tech Stack

Smart Contract Language: Compact (Midnight Network)

Frontend Framework: Pre-built Compact dApp Boilerplate (Bulletin Board Template)

Wallet Integration: One AM Wallet (Midnight.js SDK)

Containerization: Docker (for local Proof Server and Node execution)

CI/CD: GitHub Actions (Automated compact compile and testing)

5.1. Data Flow Diagram

User Action: User types feedback in the UI and clicks "Submit."

Local Execution: The DApp Connector sends the feedback text and the user's private credential to the local Proof Server running in Docker.

Circuit Proof: The Proof Server generates a ZK proof validating authorization and nullification.

Transaction Submission: The UI prompts the One AM Wallet to sign the transaction containing the proof and the feedback text.

Network Validation: The Midnight Node verifies the ZK proof.

State Update: If the proof is valid, the feedback text is appended to the public ledger.

6. Development Roadmap (Midnight Challenge Alignment)

Phase 1: New Moon (Foundation)

Objective: Establish the toolchain and basic contract logic.

Tasks:

Initialize the project and configure the Compact compiler backend (wasm).

Write whistleblower.compact.

Define the public feedback_list.

Implement a simplified isAuthorized circuit (e.g., matching a hardcoded secret for the MVP).

Compile the contract to generate the managed/ directory.

Deploy the initial contract to the Preprod network.

Phase 2: Waxing Crescent (Frontend & Wallet)

Objective: Build the UI and demonstrate the privacy behavior.

Tasks:

Clone and adapt the Pre-built Compact dApp Boilerplate (Bulletin Board).

Integrate the One AM Wallet using the SDK for wallet connection/disconnection.

Build the feedback submission form into the boilerplate UI.

Wire the frontend to execute the local circuit and submit the transaction to Preprod.

Success Metric: A user can submit feedback via the UI, and the public feed updates while their address remains hidden.

Phase 3: First Quarter (Production Hardening)

Objective: Implement CI/CD, testing, and refine the cryptography.

Tasks:

Implement robust testing (minimum 3 passing tests for authorized success, unauthorized failure, and duplicate submission failure).

Set up a GitHub Actions workflow for automated compilation and testing.

Document the precise "Privacy Model" in the repository README.

Phase 4-6: Full Moon (Advanced Cryptography - Future Scope)

Objective: Move from simplified authorization to production-ready enterprise structures.

Tasks:

Implement a Merkle Tree for the authorized employee list, allowing scalable verification without hardcoding secrets.

Implement the full cryptographic Nullifier system to prevent multiple submissions per user securely.

Add an admin function to open/close specific feedback "rounds."

7. Non-Functional Requirements

Privacy: The submitter's identity must remain mathematically disconnected from the submitted feedback.

Security: The system must reject any transaction lacking a valid ZK proof of authorization.

Performance: Local proof generation should execute within a timeframe acceptable for web applications (typically < 5 seconds).

8. Known Constraints

The application relies on the user maintaining the security of their private authorization credential in their wallet.

The initial MVP (Levels 1-3) may use simplified authorization logic (a shared secret) before upgrading to a robust Merkle-proof system in later stages.