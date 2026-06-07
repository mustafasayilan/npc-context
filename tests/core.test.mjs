import assert from "node:assert/strict";
import test from "node:test";
import { cp, mkdtemp, readFile, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { createContext, installInstructions, runBenchmark } from "../dist/index.js";
import { estimateTokens } from "../dist/core/token-estimator.js";

function posixPath(value) {
  return value.replace(/\\/g, "/");
}

async function fixtureCopy() {
  const target = await mkdtemp(join(tmpdir(), "npc-context-"));
  await cp(resolve("tests/fixtures/sample-repo"), target, { recursive: true });
  return target;
}

test("estimateTokens returns a stable local estimate", () => {
  assert.equal(estimateTokens(""), 0);
  assert.ok(estimateTokens("hello world ".repeat(100)) > 100);
});

test("createContext writes primary and Codex compatibility context", async () => {
  const root = await fixtureCopy();
  try {
    const result = await createContext({ root, task: "add a simple settings panel" });
    assert.ok(posixPath(result.contextPath).endsWith(".npc-context/task-context.md"));
    assert.ok(posixPath(result.legacyContextPath ?? "").endsWith(".codex-npc/task-context.md"));
    assert.ok(result.selectedFiles.some((file) => file.path.includes("settings")));
    const context = await readFile(result.contextPath, "utf8");
    assert.match(context, /VamaoLabs NPC Context/);
    assert.match(context, /src\/settings.ts/);
    const gitignore = await readFile(join(root, ".gitignore"), "utf8");
    assert.match(gitignore, /\.npc-context\//);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("installInstructions adds Codex and Claude project blocks", async () => {
  const root = await fixtureCopy();
  try {
    const result = await installInstructions(root, "project", "both");
    assert.equal(result.files.length, 2);
    assert.match(await readFile(join(root, "AGENTS.md"), "utf8"), /npc-context context/);
    assert.match(await readFile(join(root, "CLAUDE.md"), "utf8"), /npc-context context/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("runBenchmark reports token savings", async () => {
  const root = await fixtureCopy();
  try {
    const result = await runBenchmark(root, "add a simple settings panel");
    assert.ok(result.baselineEstimatedTokens > result.npcContextEstimatedTokens);
    assert.ok(result.estimatedSavingsPercent > 0);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
