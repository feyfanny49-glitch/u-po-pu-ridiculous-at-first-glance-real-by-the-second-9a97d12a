import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

/**
 * u-po-pu-ridiculous-at-first-glance-real-by-the-second — program/v1 entrypoint.
 *
 * Study notes from competition.yaml / RULES.txt that shaped this program:
 *
 *  - The harness gives no input data, allows no network and no secrets, and
 *    asks for exactly one artifact: /output/entry.txt. Everything needed to
 *    choose the text therefore has to be shipped in this file. Nothing is
 *    read from git history, the environment, or any path outside the repo.
 *  - The gate is mechanical: UTF-8 text of 1..200 characters, not only white
 *    space. This program applies the same check before writing, so it cannot
 *    emit an artifact the gate would refuse.
 *  - The judge is a seed investor comparing two pitches. Its brief orders the
 *    criteria: (1) a bizarre startup idea rather than anything else, (2) an
 *    idea genuinely unheard-of rather than a familiar trade with a strange
 *    adjective, (3) business logic that says who pays and why, (4) a pitch
 *    that turns laughter into a nod in one sentence under the cap, (5) vivid
 *    concrete naming of the odd thing and its buyer. It resolves a pair at
 *    the first criterion where they differ, unless a later one differs by
 *    much more. Selection below mirrors that rule rather than averaging the
 *    criteria into a mush.
 *  - Byte-identical texts share one rate and an earlier receipt wins a tie,
 *    so the winner is chosen once, deterministically, on every run.
 */

type Scores = readonly [number, number, number, number, number];

interface Candidate {
  readonly id: string;
  readonly text: string;
  readonly scores: Scores;
}

const CRITERIA = [
  "pitches a bizarre startup idea",
  "idea is genuinely bizarre, not a familiar business with a strange adjective",
  "business logic: who pays, and why it holds together",
  "one-sentence pitch with a laugh-to-nod turn, within 200 characters",
  "concrete and vivid: names the odd thing and the buyer",
] as const;

const OUTPUT_PATH = "/output/entry.txt";
const MAX_CHARS = 200;

/**
 * Worked candidates. The scores are the study: each is read against the five
 * criteria in the judge's own priority order, on a 0-5 scale.
 */
const CANDIDATES: readonly Candidate[] = [
  {
    id: "emergency-contact",
    // Revision: the second pass cuts "the phone" so the turn lands on the
    // human result, "someone finally answers", and reads as one clean pitch.
    text:
      "We sell a stranger's emergency-contact slot to lonely people who pay to be needed, and to the stranger who pays us so that at 3am someone finally answers.",
    scores: [5, 5, 5, 5, 5],
  },
  {
    id: "empty-chair",
    text:
      "We rent the empty chair at a stranger's dinner table to lonely people who pay for company, and the host pays us because an empty chair is the saddest thing in the room.",
    scores: [5, 4, 4, 4, 5],
  },
  {
    id: "under-bed-dust",
    text:
      "We sell the dust under your bed to mattress makers who pay to prove their beds shed less of it, and you pay us to vacuum it up.",
    scores: [4, 4, 4, 4, 4],
  },
  {
    id: "hurricane-ex",
    text:
      "We sell the right to name a hurricane after your ex to the ex, and charge the neighbours for the replay.",
    scores: [4, 3, 2, 3, 3],
  },
];

/**
 * Compare two candidates the way the judge's brief says a pair is decided:
 * walk the criteria in order; the first difference decides, except that a
 * much larger later difference (>= 3 points) can overturn a 1-point lead.
 */
function beats(a: Candidate, b: Candidate): boolean {
  for (let i = 0; i < CRITERIA.length; i += 1) {
    const gap = a.scores[i] - b.scores[i];
    if (gap === 0) continue;

    let bestLaterForBehind = 0;
    for (let j = i + 1; j < CRITERIA.length; j += 1) {
      const laterGap = gap > 0 ? b.scores[j] - a.scores[j] : a.scores[j] - b.scores[j];
      if (laterGap > bestLaterForBehind) bestLaterForBehind = laterGap;
    }

    if (gap > 0) return bestLaterForBehind < 3;
    return bestLaterForBehind >= 3;
  }
  // The brief's last resort for an exact tie is the smaller text.
  return a.text.length < b.text.length;
}

function choose(): Candidate {
  let winner = CANDIDATES[0];
  for (const candidate of CANDIDATES.slice(1)) {
    if (beats(candidate, winner)) winner = candidate;
  }
  return winner;
}

/** The same caps the sealed gate applies, checked before we write. */
function gate(text: string): { ok: boolean; chars: number } {
  const chars = [...text].length;
  const sentenceEnds = (text.match(/[.!?]/g) ?? []).length;
  const ok =
    chars >= 1 &&
    chars <= MAX_CHARS &&
    text.trim().length > 0 &&
    sentenceEnds === 1 &&
    /[.!?]$/.test(text);
  return { ok, chars };
}

const winner = choose();
const checked = gate(winner.text);
if (!checked.ok) {
  throw new Error(`candidate ${winner.id} fails the gate at ${checked.chars} characters`);
}

mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, winner.text, "utf8");

console.log(`wrote ${OUTPUT_PATH}: ${checked.chars} chars, candidate ${winner.id}`);
