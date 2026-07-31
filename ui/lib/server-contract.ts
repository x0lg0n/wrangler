import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

const rootDir = resolve(process.cwd(), '..');

export type SubmitResult = { ok: true; txHash: string; blockHeight: string } | { ok: false; error: string };

export async function submitFeedback(feedback: string): Promise<SubmitResult> {
  try {
    const scriptPath = resolve(rootDir, 'src', 'submit-feedback.ts');
    const output = execSync(
      `npx tsx "${scriptPath}" "${feedback.replace(/"/g, '\\"')}"`,
      {
        cwd: rootDir,
        timeout: 180000,
        encoding: 'utf-8',
        maxBuffer: 1024 * 1024,
      },
    ).trim();

    const result = JSON.parse(output);
    if (result.ok) {
      return { ok: true, txHash: result.txHash, blockHeight: result.blockHeight };
    }
    return { ok: false, error: 'Submission returned unexpected result' };
  } catch (err: any) {
    return { ok: false, error: err.stderr?.trim() || err.message || 'Submission failed' };
  }
}
