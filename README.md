# Vice City Trophy Atlas — GTA VI Trophy Guide & Tracker

[![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?ref=5548afh3)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Dilslino/gta6-trophy-guide-01-entry-v4/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01?ref=5548afh3)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Dilslino/gta6-trophy-guide-01-entry-v4/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?ref=5548afh3)

An offline guide and tracker for all **55 Grand Theft Auto VI trophies** on
PlayStation 5 (1 platinum, 2 gold, 6 silver, 46 bronze), built for the
[make.fun bounty](https://make.fun/bounty/gta6-trophy-guide-01?ref=5548afh3).

## What is in here

- **All 55 trophies, every one with a cited step-by-step guide.** Each guide is
  written in our own words (average ~1,070 characters) and names its sources
  beside the text: PowerPyx's GTA 6 Trophy Guide & Roadmap and GTABase's GTA 6
  Trophy List, with names, descriptions, and grades cross-checked against
  PSNProfiles and KeenGamer listings of the same 55.
- **The five previously unconfirmed trophies, resolved.** In The Beginning…,
  Capital Offense, and The Truth Is Out There were confirmed on launch day and
  are marked RESOLVED with exact steps. Bad Luck, I Guess and Ten Pin are still
  unconfirmed at launch: their entries say so plainly and give the best lead
  instead of inventing a trigger. No `unconfirmed` flags remain anywhere.
- **The missable wall.** Verified against PowerPyx and GTABase: exactly one
  trophy can be threatened by story progress — Positive Mental Attitude, whose
  Chapter 1 balcony meditation disappears after Chapter 1. Every other trophy
  is earnable in free-roam after the credits.
- **A roadmap to the platinum.** Three phases (story 60–80 h, 100% checklist
  ~100 h, Strangers & cleanup ~10 h), chapter order, and the working notes that
  matter: one playthrough, no online trophies, cheats off, rotate manual saves.
- **A real tracker.** Search by name, mission, or keyword; filter by grade,
  kind (story, side quests, collectibles, activities, robberies, money,
  one-offs), and earned state; a spoiler setting that hides story trophies
  until they are earned; progress saved in localStorage; export and import of
  progress as JSON.
- **Fully offline.** Plain HTML, CSS, and JavaScript. No build step, no
  network fetches, no Rockstar artwork.

## Run it

```sh
node serve.ts        # then open http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` into the output directory and writes
`dossier.json` with the vendored make.fun library. It never deletes the output
directory itself.

## Verification (checked locally before hand-in)

- 55/55 trophies named with a non-blank guide; names, descriptions, and
  grades match the kit's official list exactly.
- Guides average ~1,070 characters (shortest 810); sources on all 55.
- Zero `unconfirmed` flags. Exactly one missable: Positive Mental Attitude.
- 3 of the 5 previously unconfirmed trophies resolved at launch (In The
  Beginning…, Capital Offense, The Truth Is Out There); the other two say so
  plainly in their guide text with the best lead.
- `main.ts` runs twice byte-identical as uid 65534 with `env -i` (see below).

## Files

- `app/index.html`, `app/style.css`, `app/app.js` — the guide app
- `app/data/trophies.json` — the 55 trophies with guides and sources
- `screenshots/` — 4 real renders of the app (cover first)
- `main.ts`, `serve.ts` — hand-in program and dev server
- `vendor/makefun-frontend.ts` — the kit's library, unchanged
