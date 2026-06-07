# Architecture

NPC Context is a Node.js CLI with a small deterministic core.

```text
CLI
  commands: init, install, context, benchmark, doctor

Core
  discovery: rg first, built-in recursive fallback
  summarizer: symbols, routes, imports, snippets
  git: branch, remote, status, changed files, recent branches
  ranking: task terms + git diff + symbols + routes + manifests
  context writer: .npc-context/task-context.md
  benchmark: broad candidate estimate vs generated context estimate

Adapters
  Codex: AGENTS.md
  Claude Code: CLAUDE.md
  Generic: plain NPC_CONTEXT.md
```

## Context Flow

1. The agent or user runs `npc-context context "<task>" --root .`.
2. NPC Context makes sure helper output folders are gitignored.
3. It discovers candidate files while skipping heavy folders.
4. It summarizes each candidate with lightweight metadata.
5. It reads git state and branch information.
6. It ranks summaries for the task.
7. It writes `.npc-context/task-context.md`.
8. The agent reads that file before broad repository exploration.

## Compatibility

The primary output folder is `.npc-context/`.

For compatibility with older Codex Low-Token NPC workflows, the context command also writes `.codex-npc/task-context.md` unless `--no-legacy` is passed.
