import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

// Explicit allowlist: no repository metadata, docs, handoffs, or secrets.
const destination = 'build/worker-site';
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
for (const entry of await readdir('.')) {
  if (entry.endsWith('.html')) await cp(entry, join(destination, entry));
}
for (const directory of ['assets', 'content', 'papers']) {
  await cp(directory, join(destination, directory), { recursive: true });
}
console.log(`Prepared static assets in ${destination}`);
