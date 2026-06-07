import { join, basename, extname } from "node:path";
import { stat } from "node:fs/promises";
import {
  MANIFESTS,
  MAX_FILE_BYTES,
  SKIP_DIRS,
  SKIP_EXTENSIONS,
  SOURCE_EXTENSIONS
} from "./constants.js";
import { runCommand } from "./platform.js";
import { walkFiles } from "./fs-utils.js";

export function isDependencyTask(task: string): boolean {
  return /\b(dependenc|package|lock|npm|pnpm|yarn|pip|cargo|nuget|maven|gradle)\w*/i.test(task);
}

export async function isCandidate(root: string, relativePath: string, dependencyTask: boolean): Promise<boolean> {
  const name = basename(relativePath);
  const lower = name.toLowerCase();
  const extension = extname(lower);
  if (lower.endsWith(".min.js") || lower.endsWith(".min.css")) {
    return false;
  }
  if (extension === ".lock" && !dependencyTask) {
    return false;
  }
  if (SKIP_EXTENSIONS.has(extension) && !(dependencyTask && MANIFESTS.has(name))) {
    return false;
  }
  let info;
  try {
    info = await stat(join(root, relativePath));
  } catch {
    return false;
  }
  if (!info.isFile() || info.size > MAX_FILE_BYTES) {
    return false;
  }
  return SOURCE_EXTENSIONS.has(extension) || MANIFESTS.has(name) || name === "AGENTS.md" || name === "CLAUDE.md";
}

export async function discoverFiles(root: string, task: string): Promise<string[]> {
  const dependencyTask = isDependencyTask(task);
  const rgArgs = ["--files", "--hidden"];
  for (const directory of [...SKIP_DIRS].sort()) {
    rgArgs.push("-g", `!${directory}/**`);
  }
  const rg = await runCommand("rg", rgArgs, { cwd: root, timeoutMs: 20_000 });
  const rawFiles =
    rg.code === 0 || rg.code === 1
      ? rg.stdout.split(/\r?\n/).filter(Boolean)
      : await walkFiles(root, (name) => SKIP_DIRS.has(name));

  const candidates: string[] = [];
  for (const file of rawFiles) {
    if (await isCandidate(root, file, dependencyTask)) {
      candidates.push(file.replace(/\\/g, "/"));
    }
  }
  return [...new Set(candidates)].sort();
}
