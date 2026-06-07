export type Agent = "codex" | "claude" | "generic";

export type AgentSelection = Agent | "both";

export type InstallScope = "project" | "global";

export interface SymbolHint {
  name: string;
  line: number;
  kind?: string;
}

export interface FileSummary {
  path: string;
  bytes: number;
  mtimeMs: number;
  sha1: string;
  lines: number;
  role: string;
  symbols: SymbolHint[];
  routes: string[];
  imports: string[];
  snippet: string;
}

export interface GitInfo {
  isRepository: boolean;
  root?: string;
  branch?: string;
  remote?: string;
  changedFiles: string[];
  untrackedFiles: string[];
  recentBranches: string[];
  statusShort: string[];
}

export interface ProjectIndex {
  version: number;
  updatedAt: string;
  root: string;
  projectTypes: string[];
  dependencyFiles: string[];
  files: Record<string, FileSummary>;
  git: GitInfo;
}

export interface ContextOptions {
  root: string;
  task: string;
  agent?: Agent;
  maxFiles?: number;
  mirrorCodexLegacy?: boolean;
}

export interface ContextResult {
  contextPath: string;
  legacyContextPath?: string;
  index: ProjectIndex;
  selectedFiles: FileSummary[];
  estimatedContextTokens: number;
}

export interface BenchmarkResult {
  prompt: string;
  root: string;
  generatedAt: string;
  candidateFiles: number;
  selectedFiles: number;
  baselineEstimatedTokens: number;
  npcContextEstimatedTokens: number;
  estimatedSavingsPercent: number;
  notes: string[];
}

export interface DoctorCheck {
  name: string;
  ok: boolean;
  detail: string;
}
