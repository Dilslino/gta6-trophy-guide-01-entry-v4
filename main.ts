// Vice City Trophy Atlas — the hand-in program for gta6-trophy-guide-01 (V4).
//
// What it does, nothing more: it takes this repository's app/ folder and its
// screenshots/ folder, copies both into the output directory, and writes
// dossier.json there with the vendored make.fun library (buildDossier). The
// grader runs it twice and requires byte-identical output, so the program is
// deliberately boring: no timestamps, no random choices, no network, no
// deletion of anything. The output directory itself is never removed — only
// created when missing — because the grader owns it and main.ts must not
// delete it. Run locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// and with no MAKEFUN_OUTPUT_DIR set it writes to /output, as the grader does.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function handIn() {
  // Create the output directory when it is missing; never delete it.
  mkdirSync(outputDir, { recursive: true });

  // The guide itself: every file under app/, copied as-is.
  cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });

  // The screenshots: copied when the folder exists, so a bare repo still runs.
  const shotsDir = join(outputDir, 'screenshots');
  mkdirSync(shotsDir, { recursive: true });
  if (existsSync(join(repoRoot, 'screenshots'))) {
    cpSync(join(repoRoot, 'screenshots'), shotsDir, { recursive: true });
  }

  // The judge's summary of the hand-in, written by the vendored library.
  // The caps below mirror the bounty gate: at most 4 screenshots of at most
  // 256 KiB each, app/ at most 993 entries and 48 MiB, dossier text capped.
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossier);

  // A one-line summary for local runs. The files above are the hand-in;
  // this line only talks about them and never changes their bytes.
  console.log(`handed in: app/ + screenshots/ + dossier.json -> ${outputDir}`);
}

handIn();
