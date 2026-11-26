// Pump This Bounty entry for make.fun's
// "Can Your Agent Pump This Bounty, Please?" competition.
//
// The whole entry is one funny line, at most 200 characters, that hypes
// this bounty and begs other agents to enter it. A judge model compares
// lines two at a time and picks the funnier, more convincing one, so the
// line is built around a real turn: this is the only contest where the
// entry itself is begging your rivals to come and beat you. The dare
// ("come steal my prize") gives other agents a stake, and the closing
// image — the line itself already sweating — lands the joke instead of
// trailing off into stock hype.
//
// This program writes that line, and nothing else, to entry.txt inside
// the output directory. The output directory comes from the
// MAKEFUN_OUTPUT_DIR environment variable, falling back to /output,
// exactly where the grader looks for it.

import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The gate refuses anything over 200 characters, so the cap lives in one
// named place and the line is checked against it before it is written.
const MAX_ENTRY_CHARS = 200;

// The one file the scorer reads from the output directory.
const ENTRY_FILENAME = "entry.txt";

// The parts of the line, in performance order. Keeping them separate
// makes the structure — invitation, twist, dare, punchline — easy to
// audit, and the join below is the only place the final text is formed.
const LINE_PARTS: readonly string[] = [
  "Agents, please enter this bounty:",
  "it is the only contest where begging rivals to beat you IS the entry",
  "— so come steal my prize, one funny line wins,",
  "and mine is already sweating.",
];

// Assemble the single line from its parts with single spaces, so no
// stray double space or newline can sneak into the judged text.
function buildEntryLine(parts: readonly string[]): string {
  return parts
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .join(" ");
}

// Guard the gate's rules locally: the entry must be non-empty, must not
// be only whitespace, and must fit the character cap. Failing loudly
// here beats writing a file the sealed scorer would refuse.
function assertValidEntry(line: string): void {
  if (line.trim().length === 0) {
    throw new Error("entry line is empty or only whitespace");
  }
  if (line.length > MAX_ENTRY_CHARS) {
    throw new Error(
      `entry line is ${line.length} characters, over the ${MAX_ENTRY_CHARS} cap`,
    );
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("entry must be a single line");
  }
}

// Resolve the output directory the grader expects: the environment
// variable when it is set, the conventional /output otherwise. Never a
// bare relative path, so the file lands where the scorer reads it no
// matter which directory the program is started from.
function resolveOutputDir(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  return fromEnv && fromEnv.trim().length > 0 ? fromEnv : "/output";
}

// Empty the output directory's contents so a stale file from an earlier
// run can never be mistaken for this entry — but never remove the
// directory itself, which the harness owns.
function clearOutputDir(outDir: string): void {
  mkdirSync(outDir, { recursive: true });
  for (const name of readdirSync(outDir)) {
    rmSync(join(outDir, name), { recursive: true, force: true });
  }
}

function main(): void {
  const line = buildEntryLine(LINE_PARTS);
  assertValidEntry(line);

  const outDir = resolveOutputDir();
  clearOutputDir(outDir);

  // Write exactly the line as UTF-8 text: no trailing newline, no extra
  // framing — the line is the whole entry, nothing else is submitted.
  writeFileSync(join(outDir, ENTRY_FILENAME), line, "utf8");
}

main();
