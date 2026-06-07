# VamaoLabs NPC Context

Local, low-token context for AI coding agents.

NPC Context helps tools such as Codex and Claude Code start from a small, task-specific map of your repository instead of broadly reading files first. It indexes local files, git state, dependency manifests, routes, symbols, and task terms, then writes a compact `.npc-context/task-context.md` file for the agent to read before development work.

This project is not affiliated with OpenAI, Anthropic, or their products. Codex and Claude Code are mentioned only as supported agent targets.

## Why

AI coding agents often spend context on broad repository discovery. NPC Context moves the first pass local:

- scans only safe text/source candidates
- ignores dependency, build, cache, generated, binary, and large files
- ranks files by task terms, git diff, symbols, routes, imports, and manifests
- writes a small context file that agents can read first
- supports both project-level and global workflows

## Install

From GitHub:

```bash
npm install -g mustafasayilan/npc-context
```

After npm publication:

```bash
npm install -g @vamaolabs/npc-context
```

Run without global install:

```bash
npx github:mustafasayilan/npc-context doctor
```

## Quick Start

Inside a repository:

```bash
npc-context init --project --agent both
npc-context context "fix the login validation bug" --root .
```

Then ask your agent to read:

```text
.npc-context/task-context.md
```

For global instructions on your machine:

```bash
npc-context install --global --agent both
```

This updates user-level Codex and Claude instruction files without changing application source code.

## Commands

```bash
npc-context init --project --agent codex
npc-context init --project --agent claude
npc-context init --project --agent both

npc-context install --global --agent both
npc-context context "add a settings page" --root .
npc-context benchmark --prompt "add a settings page" --root .
npc-context doctor --root .
```

## Agent Support

### Codex

Project mode writes or updates `AGENTS.md`.

Global mode writes or updates:

```text
~/.codex/AGENTS.md
```

NPC Context writes `.npc-context/task-context.md` and, by default, a compatibility copy at `.codex-npc/task-context.md`.

### Claude Code

Project mode writes or updates `CLAUDE.md`.

Global mode writes or updates:

```text
~/.claude/CLAUDE.md
```

NPC Context avoids symlink-based setup so it works cleanly on Windows.

## Project vs Global

Project install:

- applies to one repository
- creates or updates `AGENTS.md` and/or `CLAUDE.md`
- adds NPC helper folders to `.gitignore`
- creates `.npc-context/`

Global install:

- applies to your local user profile
- updates user-level agent instruction files
- does not touch application repositories

## What NPC Context Writes

In project mode:

```text
.npc-context/
  task-context.md
  index.json
  benchmark-results.json
  benchmark-results.md

.codex-npc/
  task-context.md
```

The `.codex-npc/` folder is compatibility output for older Codex Low-Token NPC workflows.

## Benchmark

Run:

```bash
npm run build
npm run benchmark:sample
```

Example result on the included sample repository:

```text
Candidate files: 13
Selected files: 4
Baseline estimated tokens: 1,627
NPC Context estimated tokens: 341
Estimated savings: 79.0%
```

The exact result can vary as the scanner improves. Token counts are local estimates, not billing guarantees. See [docs/benchmarks.md](docs/benchmarks.md).

## Minimum Requirements

- Node.js 18.18 or newer
- Windows 10+, Linux, WSL, or macOS
- Git optional but recommended for branch and diff awareness
- ripgrep (`rg`) optional but recommended for faster scanning
- No GPU
- No model API key
- Typical memory use: under 100 MB for ordinary repositories
- Disk use: usually a few MB in `.npc-context/`

For very large monorepos, runtime scales with the number of candidate text/source files that are not ignored.

## Safety Model

NPC Context is a local indexing and instruction helper. It does not call LLM APIs and does not edit application behavior during context generation. It may create or update:

- `.npc-context/`
- `.codex-npc/`
- `.gitignore`
- `AGENTS.md`
- `CLAUDE.md`
- user-level instruction files when global install is requested

Review generated instruction files before committing them.

## Disclaimer

NPC Context is provided on an "AS IS" and "AS AVAILABLE" basis, without warranties of any kind. You are responsible for reviewing generated context, generated instruction files, commands run by your AI agent, and any changes made to your projects. VamaoLabs and contributors are not responsible for data loss, broken builds, security issues, business interruption, or other damages arising from use or misuse of this tool.

This README is not legal advice. For legal, compliance, trademark, or licensing questions, consult a qualified professional.

## License and Brand

Source code is licensed under Apache-2.0. See [LICENSE](LICENSE).

VamaoLabs names, logos, and product names are not granted by the software license. See [TRADEMARKS.md](TRADEMARKS.md).

You may fork, modify, and redistribute the code under the license terms, but you may not present modified versions as official VamaoLabs releases without permission.

## Documentation

- [Architecture](docs/architecture.md)
- [Benchmarks](docs/benchmarks.md)
- [Minimum requirements](docs/minimum-requirements.md)
- [Release process](docs/release.md)
- [Turkish summary](docs/tr.md)
- [Russian summary](docs/ru.md)
