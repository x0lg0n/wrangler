import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { kv } from '@vercel/kv';

// Shared, Redis-backed feedback store (Vercel KV / Upstash).
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

let client: typeof kv | null | undefined;

function getClient(): typeof kv | null {
  if (client === undefined) {
    client =
      process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
        ? kv
        : null;
  }
  return client;
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

async function seedStore(
  c: typeof kv,
  seed: StoredFeedback[],
): Promise<void> {
  for (const entry of seed) {
    await c.rpush(KV_KEY, JSON.stringify(entry));
  }
}

export async function loadFeedbacksFromStore(): Promise<StoredFeedback[]> {
  const c = getClient();
  if (c) {
    try {
      const newestFirst = (await c.lrange(KV_KEY, 0, -1)) as string[];
      const parsed = newestFirst
        .map((raw: string) => parseEntry(raw))
        .filter((e): e is StoredFeedback => e !== null);
      if (parsed.length > 0) return parsed.reverse();
    } catch {
      // redis unavailable: fall through to local sources
    }
    const seed = localFeedbacks();
    if (seed.length > 0) {
      try {
        await seedStore(c, seed);
      } catch {
        // seeding failed: fall back to local sources for this read
      }
      return seed;
    }
    return [];
  }
  return localFeedbacks();
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
  const c = getClient();
  if (c) {
    try {
      entry.id = (await c.llen(KV_KEY)) + 1;
      await c.lpush(KV_KEY, JSON.stringify(entry));
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
