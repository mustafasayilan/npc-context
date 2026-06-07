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
