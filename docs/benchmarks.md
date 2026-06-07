# Benchmarks

NPC Context includes a local benchmark command:

```bash
npc-context benchmark --prompt "add a simple settings panel" --root .
```

The benchmark compares:

- **Baseline estimated tokens:** all candidate text/source files that a broad first pass might inspect.
- **NPC Context estimated tokens:** the generated `.npc-context/task-context.md`.

It writes:

```text
.npc-context/benchmark-results.json
.npc-context/benchmark-results.md
```

## Repeatable Sample

After building:

```bash
npm run benchmark:sample
```

Current sample result:

```text
Prompt: add a simple settings panel
Candidate files: 13
Selected files: 4
Baseline estimated tokens: 1,627
NPC Context estimated tokens: 341
Estimated savings: 79.0%
```

The included fixture is still small enough for fast tests. Larger real repositories can show larger or smaller percentage reductions depending on task specificity, repository layout, and how much unrelated source exists.

## Realistic Synthetic Suite

Run:

```bash
npm run benchmark:realistic
```

Current result:

```text
Repository shape: 16 domains, 68 candidate files, 5 prompts
Average estimated savings: 89.2%
```

Per-prompt results:

| Prompt | Candidate files | Selected files | Baseline tokens | NPC tokens | Estimated savings |
| --- | ---: | ---: | ---: | ---: | ---: |
| add a simple settings panel | 68 | 7 | 8,141 | 431 | 94.7% |
| fix invoice total rounding bug | 68 | 2 | 8,141 | 212 | 97.4% |
| add search result ranking by tag | 68 | 20 | 8,141 | 1,268 | 84.4% |
| update webhook retry handling | 68 | 20 | 8,141 | 1,288 | 84.2% |
| add permission audit export | 68 | 20 | 8,141 | 1,210 | 85.1% |

This suite is generated locally by `scripts/benchmark-realistic.mjs`. It models a multi-domain TypeScript SaaS repository with feature services, API route files, tests, and docs. It is not a replacement for benchmarking on a real private codebase, but it is a more realistic regression test than the tiny sample fixture.

## Important Limits

These numbers are estimates. They are useful for comparing broad local scan size with NPC Context output size, but they are not provider billing guarantees.

Actual token use depends on:

- the agent
- the model
- the chat history
- system and developer instructions
- tool outputs
- files the agent reads after the NPC context
- user follow-up prompts
