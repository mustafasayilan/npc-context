# VamaoLabs NPC Context

A small local context preflight for AI coding agents.

I built NPC Context because coding agents often spend their first turn doing the same noisy repository discovery: list files, open broad docs, inspect manifests, then slowly narrow down. This CLI does that first pass locally and writes a compact `.npc-context/task-context.md` file that Codex, Claude Code, or another agent can read before touching the project.

It looks at safe text/source candidates, git state, dependency manifests, routes, symbols, imports, and the task prompt. It does not call model APIs, and context generation should not change application behavior.

## Benchmark Snapshot

```text
Small sample:        79.0% estimated token reduction
Realistic SaaS test: 89.2% average estimated token reduction
Range:               84.2% to 97.4%
```

Token counts are local estimates for comparing broad repository scanning with NPC Context output. They are not provider billing guarantees. See [docs/benchmarks.md](docs/benchmarks.md).

## Support

If this project, or other open source work from Mustafa/VamaoLabs, saves you time, sponsorship helps keep maintenance moving.

[Sponsor Mustafa on GitHub](https://github.com/sponsors/mustafasayilan).

The repository includes `.github/FUNDING.yml`, so GitHub can show the Sponsor button here. The GitHub Sponsors profile is account-level, not a separate profile for each repository. Payouts are handled through the maintainer's approved GitHub Sponsors profile.

See [Funding setup](docs/funding.md).

This project is not affiliated with OpenAI, Anthropic, or their products. Codex and Claude Code are mentioned only as supported agent targets.

## Why

The main idea is simple: give the agent a useful map before it starts reading files. NPC Context keeps that map intentionally small:

- scans only safe text/source candidates
- ignores dependency, build, cache, generated, binary, and large files
- ranks files by task terms, git diff, symbols, routes, imports, and manifests
- writes a small context file that agents can read first
- supports both project-level and global workflows

## Install

From GitHub:

```bash
npm install -g https://github.com/mustafasayilan/npc-context/archive/refs/heads/main.tar.gz
```

After npm publication:

```bash
npm install -g @vamaolabs/npc-context
```

Run without global install:

```bash
npx --yes https://github.com/mustafasayilan/npc-context/archive/refs/heads/main.tar.gz doctor
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
npm run benchmark:realistic
```

Example result on the included sample repository:

```text
Candidate files: 13
Selected files: 4
Baseline estimated tokens: 1,627
NPC Context estimated tokens: 341
Estimated savings: 79.0%
```

Realistic synthetic suite result:

```text
Repository shape: 16 domains, 68 candidate files, 5 prompts
Average estimated savings: 89.2%
Range: 84.2% to 97.4%
```

The exact result can vary as the scanner changes. These numbers are meant for regression checks and rough comparison, not for claiming a guaranteed bill reduction.

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
- [Funding setup](docs/funding.md)
- [Minimum requirements](docs/minimum-requirements.md)
- [Release process](docs/release.md)
- [Turkish summary](docs/tr.md)
- [Russian summary](docs/ru.md)
