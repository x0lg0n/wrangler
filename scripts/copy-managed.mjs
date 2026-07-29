import { rmSync, cpSync } from 'node:fs';
import { resolve } from 'node:path';

const src = resolve(process.argv[2]);
const dest = resolve(process.argv[3]);

rmSync(dest, { recursive: true, force: true });
cpSync(src, dest, { recursive: true });
