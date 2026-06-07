import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join, relative } from "node:path";
import { GITIGNORE_LINES } from "./constants.js";
import { normalizePath } from "./platform.js";

export async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export async function readText(path: string): Promise<string> {
  return readFile(path, "utf8");
}

export async function readTextIfExists(path: string): Promise<string> {
  try {
    return await readText(path);
  } catch {
    return "";
  }
}

export async function writeText(path: string, value: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, value, "utf8");
}

export function sha1(value: string): string {
  return createHash("sha1").update(value).digest("hex").slice(0, 12);
}

export function relativePosix(root: string, path: string): string {
  return normalizePath(relative(root, path));
}

export async function walkFiles(root: string, skipDir: (name: string) => boolean): Promise<string[]> {
  const files: string[] = [];
  async function visit(current: string): Promise<void> {
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        if (!skipDir(entry.name)) {
          await visit(fullPath);
        }
      } else if (entry.isFile()) {
        files.push(relativePosix(root, fullPath));
      }
    }
  }
  await visit(root);
  return files;
}

export async function ensureGitignore(root: string, extraLines: string[] = []): Promise<boolean> {
  const path = join(root, ".gitignore");
  const existing = await readTextIfExists(path);
  const existingLines = new Set(existing.split(/\r?\n/));
  const required = [...GITIGNORE_LINES, ...extraLines];
  const missing = required.filter((line) => !existingLines.has(line));
  if (missing.length === 0) {
    return false;
  }
  const prefix = existing.length === 0 || existing.endsWith("\n") ? "" : "\n";
  const block = `${prefix}\n# VamaoLabs NPC Context\n${missing.join("\n")}\n`;
  await writeText(path, existing + block);
  return true;
}

export function utcNow(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}
