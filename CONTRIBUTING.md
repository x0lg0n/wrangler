# Contributing to Midnight Whistleblower Protocol

We welcome contributions! Whether it's bug reports, feature requests, or pull requests, your help is appreciated.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/<your-username>/whistleblower-protocol.git`
3. Set up the dev environment (see [README](README.md#quick-start))
4. Create a branch: `git checkout -b feature/my-feature`

## Development

### Code Style

- TypeScript: strict mode, ES2022 target
- Compact: pragma >= 0.23
- Follow existing patterns in the codebase

### Testing

Run contract + API builds to verify:
```bash
pnpm run build
```

### Commit Messages

Write clear, conventional commits:
```
feat: add merkle-tree authorization
fix: handle nullifier collision edge case
docs: update deployment instructions
```

## Pull Requests

1. Ensure all builds pass
2. Update documentation if needed
3. Keep PRs focused — one feature/fix per PR
4. Link any related issues

## Issues

Use the following templates:
- **Bug report** — steps to reproduce, expected vs actual behavior
- **Feature request** — use case, expected outcome
- **Documentation** — what's missing or incorrect

## License

By contributing, you agree that your contributions will be licensed under Apache 2.0.
