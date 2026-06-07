import { basename } from "node:path";
import { MANIFESTS } from "./constants.js";
import type { FileSummary } from "./types.js";

const STOP_WORDS = new Set([
  "about",
  "after",
  "and",
  "bir",
  "bug",
  "can",
  "code",
  "dosya",
  "fix",
  "for",
  "from",
  "gibi",
  "ile",
  "icin",
  "için",
  "make",
  "olan",
  "the",
  "this",
  "that",
  "with",
  "yap",
  "yeni"
]);

export function taskTerms(task: string): Set<string> {
  const terms = new Set<string>();
  for (const match of task.matchAll(/[\p{L}_][\p{L}\p{N}_.-]{2,}/gu)) {
    const raw = match[0].toLowerCase();
    if (!STOP_WORDS.has(raw)) {
      terms.add(raw);
      for (const part of raw.split(/[_.-]/)) {
        if (part.length > 2 && !STOP_WORDS.has(part)) terms.add(part);
      }
    }
  }
  return terms;
}

export function scoreFile(record: FileSummary, terms: Set<string>, changed: Set<string>, untracked: Set<string>): number {
  const lowerPath = record.path.toLowerCase();
  const haystack = [
    lowerPath,
    record.role,
    record.snippet.toLowerCase(),
    record.symbols.map((symbol) => symbol.name).join(" ").toLowerCase(),
    record.routes.join(" ").toLowerCase(),
    record.imports.join(" ").toLowerCase()
  ].join(" ");
  let score = 0;
  if (changed.has(record.path)) score += 35;
  if (untracked.has(record.path)) score += 25;
  for (const term of terms) {
    if (lowerPath.includes(term)) score += 8;
    if (haystack.includes(term)) score += 4;
  }
  if (record.role === "manifest") score += 2;
  if (MANIFESTS.has(basename(record.path))) score += 2;
  if (terms.has("test") || terms.has("tests")) {
    if (record.role === "test") score += 12;
  }
  if (terms.has("api") || terms.has("route") || terms.has("endpoint")) {
    score += record.routes.length > 0 ? 12 : 0;
  }
  return score;
}

export function selectRelevantFiles(
  files: FileSummary[],
  terms: Set<string>,
  changedFiles: string[],
  untrackedFiles: string[],
  maxFiles: number
): FileSummary[] {
  const changed = new Set(changedFiles.map((file) => file.replace(/\\/g, "/")));
  const untracked = new Set(untrackedFiles.map((file) => file.replace(/\\/g, "/")));
  const ranked = [...files].sort((a, b) => {
    const scoreDelta = scoreFile(b, terms, changed, untracked) - scoreFile(a, terms, changed, untracked);
    return scoreDelta || a.path.localeCompare(b.path);
  });
  const selected = ranked.filter((file) => scoreFile(file, terms, changed, untracked) > 0).slice(0, maxFiles);
  if (selected.length > 0) return selected;
  return ranked.slice(0, Math.min(maxFiles, 14));
}
