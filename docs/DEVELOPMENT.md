# Development Guide

## Setup

```bash
pnpm install
pnpm run compact
pnpm run build
```

## Development Workflow

### Contract Development

Edit `contract/src/whistleblower.compact`, then:

```bash
pnpm run compact    # Recompile circuits
pnpm run build      # Rebuild TypeScript
pnpm run test       # Run tests
```

### API Development

Edit `api/src/`, then:

```bash
pnpm run build    # Rebuild
pnpm run test     # Run tests
```

## Testing

```bash
pnpm run test              # Run all tests
pnpm run test -- --watch   # Watch mode
```

Tests live in `tests/` and cover:
- Contract compilation artifacts exist
- Circuit keys generated
- Source code integrity
- Private state creation
- API module exports

## Adding a New Network

1. Add the network config in `src/network.ts`:
   ```typescript
   mynet: {
     networkId: 'mynet',
     indexer: 'https://indexer.mynet.midnight.network/api/v4/graphql',
     indexerWS: 'wss://indexer.mynet.midnight.network/api/v4/graphql/ws',
     node: 'https://rpc.mynet.midnight.network',
     proofServer: 'http://127.0.0.1:6300',
     faucet: 'https://faucet.mynet.midnight.network',
     composeServices: ['proof-server'],
   },
   ```
2. Add `'mynet'` to the `NetworkId` union type
3. Add `'mynet'` to the `NETWORK_IDS` const array

## CI/CD

Add GitHub Actions to `.github/workflows/`:

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm run build
      - run: pnpm run test
```

## Release Process

1. Update `CHANGELOG.md`
2. Bump version in `package.json`
3. Tag the release: `git tag v0.2.0 && git push --tags`
