import { join } from "node:path";
import { MANIFESTS, NPC_DIR, LEGACY_CODEX_DIR, VERSION } from "./constants.js";
import { discoverFiles } from "./discover.js";
import { ensureGitignore, readTextIfExists, utcNow, writeText } from "./fs-utils.js";
import { getGitInfo } from "./git.js";
import { selectRelevantFiles, taskTerms } from "./rank.js";
import { detectProjectTypes, summarizeFile } from "./summarize.js";
import { estimateTokens, formatNumber } from "./token-estimator.js";
import type { ContextOptions, ContextResult, FileSummary, ProjectIndex } from "./types.js";

export async function buildIndex(root: string, task: string): Promise<ProjectIndex> {
  await ensureGitignore(root);
  const discovered = await discoverFiles(root, task);
  const summaries: Record<string, FileSummary> = {};
  for (const relativePath of discovered) {
    const summary = await summarizeFile(root, relativePath);
    if (summary) summaries[summary.path] = summary;
  }
  const packageJson = await readTextIfExists(join(root, "package.json"));
  const git = await getGitInfo(root);
  const index: ProjectIndex = {
    version: VERSION,
    updatedAt: utcNow(),
    root,
    projectTypes: detectProjectTypes(Object.keys(summaries), packageJson),
    dependencyFiles: Object.keys(summaries)
      .filter((path) => MANIFESTS.has(path.split("/").at(-1) ?? ""))
      .sort(),
    files: summaries,
    git
  };
  await writeText(join(root, NPC_DIR, "index.json"), JSON.stringify(index, null, 2));
  return index;
}

function listOrNone(items: string[], limit = 40): string[] {
  return items.length ? items.slice(0, limit).map((item) => `- ${item}`) : ["- None detected"];
}

function renderContext(task: string, index: ProjectIndex, selectedFiles: FileSummary[]): string {
  const lines: string[] = [
    "# VamaoLabs NPC Context",
    `Generated: ${utcNow()}`,
    `Task: ${task || "(not provided)"}`,
    `Project types: ${index.projectTypes.join(", ")}`,
    `Candidate files indexed: ${formatNumber(Object.keys(index.files).length)}`,
    "",
    "## Repository",
    `- Git repository: ${index.git.isRepository ? "yes" : "no or unavailable"}`,
    `- Branch: ${index.git.branch ?? "(unknown)"}`,
    `- Remote: ${index.git.remote ?? "(none detected)"}`,
    "",
    "## Git Status",
    ...listOrNone(index.git.statusShort, 80),
    "",
    "## Changed Files",
    ...listOrNone([...index.git.changedFiles, ...index.git.untrackedFiles], 80),
    "",
    "## Recent Branches",
    ...listOrNone(index.git.recentBranches, 12),
    "",
    "## Dependency Files",
    ...listOrNone(index.dependencyFiles, 40),
    "",
    "## Relevant Files"
  ];

  for (const record of selectedFiles) {
    lines.push(`- ${record.path} (${record.role}, ${formatNumber(record.lines)} lines, ${formatNumber(record.bytes)} bytes)`);
    const symbols = record.symbols
      .slice(0, 14)
      .map((symbol) => `${symbol.name}:${symbol.line}`)
      .join(", ");
    if (symbols) lines.push(`  Symbols: ${symbols}`);
    if (record.routes.length) lines.push(`  Routes: ${record.routes.slice(0, 10).join(", ")}`);
    if (record.imports.length) lines.push(`  Imports: ${record.imports.slice(0, 10).join(", ")}`);
    if (record.snippet) lines.push(`  Snippet: ${record.snippet}`);
  }

  lines.push(
    "",
    "## Agent Guidance",
    "- Start with the files, symbols, routes, and git diff paths above.",
    "- Read additional files only when the task requires it.",
    "- Do not scan heavy generated, dependency, build, cache, or binary directories.",
    "- Refresh this context after meaningful edits.",
    "- NPC bootstrap must not modify application behavior."
  );
  return `${lines.join("\n")}\n`;
}

export async function createContext(options: ContextOptions): Promise<ContextResult> {
  const maxFiles = options.maxFiles ?? 20;
  const index = await buildIndex(options.root, options.task);
  const selectedFiles = selectRelevantFiles(
    Object.values(index.files),
    taskTerms(options.task),
    index.git.changedFiles,
    index.git.untrackedFiles,
    maxFiles
  );
  const context = renderContext(options.task, index, selectedFiles);
  const contextPath = join(options.root, NPC_DIR, "task-context.md");
  await writeText(contextPath, context);

  let legacyContextPath: string | undefined;
  if (options.mirrorCodexLegacy !== false) {
    legacyContextPath = join(options.root, LEGACY_CODEX_DIR, "task-context.md");
    await writeText(legacyContextPath, context);
  }

  return {
    contextPath,
    legacyContextPath,
    index,
    selectedFiles,
    estimatedContextTokens: estimateTokens(context)
  };
}
