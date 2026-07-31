// Server-side decoder for the v6 contract-state blob returned by the indexer.
// Pure Buffer implementation: compact-runtime pulls in onchain-runtime-v3,
// which reads its WASM via fs at module scope and breaks on serverless
// filesystems. Layout verified empirically against indexer history:
// blob = "midnight:contract-state[v6]:" + 'd' tag + 2 bytes + count (uint8)
// + [ledger: feedbackCount, authorizationSecret] + witnesses + coin info.

const STATE_PREFIX = Buffer.from('midnight:contract-state[v6]:', 'utf8');
const COUNT_OFFSET = 3;

export function decodeFeedbackCount(stateHex: string): number | null {
  try {
    const hex = stateHex.startsWith('0x') ? stateHex.slice(2) : stateHex;
    const buf = Buffer.from(hex, 'hex');
    const idx = buf.indexOf(STATE_PREFIX);
    if (idx < 0) return null;
    const count = buf[idx + STATE_PREFIX.length + COUNT_OFFSET];
    if (count === undefined) return null;
    return count;
  } catch {
    return null;
  }
}
