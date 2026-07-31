# Security Policy

The Midnight Wrangler Protocol uses Zero-Knowledge Proofs for authorization —
the security of the system depends on the integrity of the circuits and the
confidentiality of authorization credentials.

## Reporting a Vulnerability

If you discover a security vulnerability, **do not open a public issue**.

Instead, use GitHub's private vulnerability reporting:
1. Go to the repository's "Security" tab
2. Click "Report a vulnerability"
3. Provide details (including steps to reproduce and impact assessment)

Alternatively, email the maintainer at the address shown in the commit history.

We will acknowledge receipt within 3 business days and work toward a fix.

## What to Report

- ZK circuit weaknesses that could bypass authorization
- Cryptographic nullifier collisions or replay attacks
- Credential leakage or side-channel attacks
- Dependency vulnerabilities with CVSS >= 7.0

## Scope

This policy covers the `contract/`, `api/`, and `src/` directories. Issues in
third-party dependencies should be reported to their respective maintainers.
