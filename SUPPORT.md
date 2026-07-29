# Support

## Getting Help

- **Documentation**: See [README](README.md) for setup and usage
- **Issues**: Report bugs via [GitHub Issues](https://github.com/x0lg0n/whistleblower-protocol/issues)
- **Discussions**: Use GitHub Discussions for questions and ideas

## Troubleshooting

### Proof server fails to start
```bash
docker compose logs proof-server
```
The proof server downloads ZK parameters on first run. Ensure internet connectivity.

### Port conflicts
```bash
docker compose down
docker ps -a  # Check for stale containers
docker rm <container-id>
```

### Build errors
```bash
pnpm install
pnpm run build
```
Delete `node_modules` and `pnpm-lock.yaml` if dependency issues persist.
