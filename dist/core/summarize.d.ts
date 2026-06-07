import type { FileSummary } from "./types.js";
export declare function summarizeFile(root: string, relativePath: string): Promise<FileSummary | undefined>;
export declare function detectProjectTypes(files: string[], packageJson?: string): string[];
