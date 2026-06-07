import type { FileSummary } from "./types.js";
export declare function taskTerms(task: string): Set<string>;
export declare function scoreFile(record: FileSummary, terms: Set<string>, changed: Set<string>, untracked: Set<string>): number;
export declare function selectRelevantFiles(files: FileSummary[], terms: Set<string>, changedFiles: string[], untrackedFiles: string[], maxFiles: number): FileSummary[];
