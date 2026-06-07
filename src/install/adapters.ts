import { join } from "node:path";
import { mkdir } from "node:fs/promises";
import { ensureGitignore, readTextIfExists, writeText } from "../core/fs-utils.js";
import { homePath } from "../core/platform.js";
import type { Agent, AgentSelection, InstallScope } from "../core/types.js";
import { instructionBlock, upsertBlock } from "./instructions.js";

function expandAgents(selection: AgentSelection): Agent[] {
  if (selection === "both") return ["codex", "claude"];
  return [selection];
}

function targetFile(root: string, scope: InstallScope, agent: Agent): string {
  if (scope === "project") {
    if (agent === "codex") return join(root, "AGENTS.md");
    if (agent === "claude") return join(root, "CLAUDE.md");
    return join(root, "NPC_CONTEXT.md");
  }
  if (agent === "codex") return homePath(".codex", "AGENTS.md");
  if (agent === "claude") return homePath(".claude", "CLAUDE.md");
  return homePath(".npc-context", "NPC_CONTEXT.md");
}

export interface InstallResult {
  files: string[];
  gitignoreUpdated: boolean;
}

export async function installInstructions(
  root: string,
  scope: InstallScope,
  agentSelection: AgentSelection
): Promise<InstallResult> {
  const files: string[] = [];
  let gitignoreUpdated = false;
  if (scope === "project") {
    gitignoreUpdated = await ensureGitignore(root);
    await mkdir(join(root, ".npc-context"), { recursive: true });
  }

  for (const agent of expandAgents(agentSelection)) {
    const file = targetFile(root, scope, agent);
    const existing = await readTextIfExists(file);
    const next = upsertBlock(existing, instructionBlock(agent, scope));
    await writeText(file, next);
    files.push(file);
  }
  return { files, gitignoreUpdated };
}
