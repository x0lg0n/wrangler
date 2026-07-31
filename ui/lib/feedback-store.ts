import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Shared, Redis-backed feedback store (Vercel KV / Upstash REST API).
// Talks to Upstash directly with plain fetch (cache: 'no-store') instead of
// the @vercel/kv client, which misbehaved non-deterministically inside the
// Next.js server bundle (reads returned empty, triggering repeated re-seeds).
// Falls back to the static MIDNIGHT_FEEDBACKS env var / .feedbacks.json
// when KV_REST_API_URL / KV_REST_API_TOKEN are not configured (local dev),
// and tolerates the read-only serverless filesystem.
//
// Layout: a single Redis list, newest-first. Seeded on first read from the
// local sources so the demo entries stay shared. Ordering is oldest-first
// on read (the dashboard reverses it for display).

const KV_KEY = 'feedbacks:v1';
const rootDir = resolve(process.cwd(), '..');
const feedbacksPath = resolve(rootDir, '.feedbacks.json');

export interface StoredFeedback {
  id: number;
  message: string;
  timestamp: string;
  txId?: string;
}

export interface StoreDiagnostics {
  source: 'redis' | 'local';
  error?: string;
  count: number;
}

let lastDiagnostics: StoreDiagnostics = { source: 'local', count: 0 };

export function getStoreDiagnostics(): StoreDiagnostics {
  return lastDiagnostics;
}

function kvConfigured(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function redisCommand<T>(path: string): Promise<T> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  const res = await fetch(`${url}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Upstash ${path.split('/')[1] ?? 'request'} failed: HTTP ${res.status} ${res.statusText}`);
  }
  const body = (await res.json()) as { result?: T; error?: string };
  if (body.error) throw new Error(`Upstash error: ${body.error}`);
  return body.result as T;
}

async function redisLlen(): Promise<number> {
  return redisCommand<number>(`/llen/${KV_KEY}`);
}

async function redisLrange(start: number, stop: number): Promise<string[]> {
  return redisCommand<string[]>(`/lrange/${KV_KEY}/${start}/${stop}`);
}

async function redisLpush(value: string): Promise<void> {
  await redisCommand<number>(`/lpush/${KV_KEY}/${encodeURIComponent(value)}`);
}

async function redisRpush(value: string): Promise<void> {
  await redisCommand<number>(`/rpush/${KV_KEY}/${encodeURIComponent(value)}`);
}

function localFeedbacks(): StoredFeedback[] {
  const fromEnv = process.env.MIDNIGHT_FEEDBACKS;
  if (fromEnv) {
    try {
      return JSON.parse(fromEnv) as StoredFeedback[];
    } catch {
      return [];
    }
  }
  if (!existsSync(feedbacksPath)) return [];
  try {
    return JSON.parse(readFileSync(feedbacksPath, 'utf-8'));
  } catch {
    return [];
  }
}

function parseEntry(raw: string): StoredFeedback | null {
  try {
    const entry = JSON.parse(raw) as StoredFeedback;
    if (typeof entry?.message !== 'string') return null;
    return entry;
  } catch {
    return null;
  }
}

function dedupe(entries: StoredFeedback[]): StoredFeedback[] {
  const seen = new Set<string>();
  const unique: StoredFeedback[] = [];
  for (const entry of entries) {
    const key =
      typeof entry.id === 'number'
        ? `id:${entry.id}`
        : `${entry.message}|${entry.timestamp}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(entry);
  }
  return unique;
}

async function seedStore(seed: StoredFeedback[]): Promise<void> {
  for (const entry of seed) {
    await redisRpush(JSON.stringify(entry));
  }
}

export async function loadFeedbacksFromStore(): Promise<StoredFeedback[]> {
  if (kvConfigured()) {
    try {
      const newestFirst = await redisLrange(0, -1);
      const parsed = newestFirst
        .map((raw) => parseEntry(raw))
        .filter((e): e is StoredFeedback => e !== null);
      if (parsed.length > 0) {
        const chronological = parsed
          .slice()
          .sort((a, b) => a.timestamp.localeCompare(b.timestamp) || (a.id ?? 0) - (b.id ?? 0));
        const unique = dedupe(chronological);
        lastDiagnostics = { source: 'redis', count: unique.length };
        return unique;
      }
    } catch (err) {
      console.error('[feedback-store] redis read failed:', err);
      lastDiagnostics = { source: 'local', error: err instanceof Error ? err.message : String(err), count: 0 };
    }
    const seed = localFeedbacks();
    if (seed.length > 0) {
      try {
        await seedStore(seed);
      } catch (seedErr) {
        console.error('[feedback-store] redis seeding failed:', seedErr);
      }
      lastDiagnostics = { source: 'local', count: seed.length };
      return seed;
    }
    return [];
  }
  const seed = localFeedbacks();
  lastDiagnostics = { source: 'local', count: seed.length };
  return seed;
}

export async function appendFeedback(
  message: string,
  txId?: string,
): Promise<{ entry: StoredFeedback; persisted: 'redis' | 'file' | 'none'; error?: string }> {
  const entry: StoredFeedback = {
    id: 0,
    message,
    timestamp: new Date().toISOString(),
    txId,
  };
  if (kvConfigured()) {
    try {
      entry.id = (await redisLlen()) + 1;
      await redisLpush(JSON.stringify(entry));
      return { entry, persisted: 'redis' };
    } catch (err: any) {
      // redis write failed: surface the reason, fall through to the local file
      try {
        const list = localFeedbacks();
        entry.id = list.reduce((max, f) => Math.max(max, f.id ?? 0), 0) + 1;
        list.push(entry);
        writeFileSync(feedbacksPath, JSON.stringify(list, null, 2));
        return { entry, persisted: 'file', error: err?.message ?? String(err) };
      } catch (fileErr: any) {
        return {
          entry,
          persisted: 'none',
          error: `${err?.message ?? String(err)}; file fallback: ${fileErr?.message ?? String(fileErr)}`,
        };
      }
    }
  }
  const list = localFeedbacks();
  entry.id = list.reduce((max, f) => Math.max(max, f.id ?? 0), 0) + 1;
  list.push(entry);
  try {
    writeFileSync(feedbacksPath, JSON.stringify(list, null, 2));
    return { entry, persisted: 'file' };
  } catch (err: any) {
    return { entry, persisted: 'none', error: err?.message ?? String(err) };
  }
}
