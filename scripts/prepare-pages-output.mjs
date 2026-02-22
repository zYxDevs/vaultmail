import { cp, mkdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const OPEN_NEXT_DIR = path.join(ROOT, '.open-next');
const OPEN_NEXT_ASSETS = path.join(OPEN_NEXT_DIR, 'assets');
const OPEN_NEXT_WORKER = path.join(OPEN_NEXT_DIR, 'worker.js');
const PAGES_OUTPUT = path.join(ROOT, '.cf-pages');
const PAGES_WORKER = path.join(PAGES_OUTPUT, '_worker.js');

const ensureOpenNextBuildExists = async () => {
  await stat(OPEN_NEXT_DIR);
  await stat(OPEN_NEXT_ASSETS);
  await stat(OPEN_NEXT_WORKER);
};

const main = async () => {
  await ensureOpenNextBuildExists();

  await rm(PAGES_OUTPUT, { recursive: true, force: true });
  await mkdir(PAGES_OUTPUT, { recursive: true });

  // Keep the OpenNext runtime module graph available for _worker.js imports.
  await cp(OPEN_NEXT_DIR, PAGES_OUTPUT, { recursive: true });

  // Expose static assets at Pages root where _worker.js/ASSETS will resolve URLs.
  await cp(OPEN_NEXT_ASSETS, PAGES_OUTPUT, { recursive: true });

  // Pages expects the worker entrypoint to be named _worker.js.
  await cp(OPEN_NEXT_WORKER, PAGES_WORKER);

  console.log('Prepared Cloudflare Pages output at .cf-pages');
};

main().catch((error) => {
  console.error('Failed to prepare Cloudflare Pages output:', error);
  process.exit(1);
});
