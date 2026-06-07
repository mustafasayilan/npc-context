<!-- npc-context:start -->
## VamaoLabs NPC Context
Before development work in any repository:
1. Run `npc-context context "<user task>" --root . --agent claude` before opening or searching project files.
2. Read `.npc-context/task-context.md` and start with the targeted paths, symbols, routes, dependency hints, and git diff paths listed there.
3. Expand file reads only when the task requires it; avoid generated, dependency, build, cache, and binary directories.
4. Refresh the NPC context after meaningful edits.
5. NPC bootstrap may create only `.npc-context/`, optional compatibility context folders, and gitignore protection. It must not modify application behavior.
If the command is not available on PATH, install it from the project README or run it through your package manager before continuing.
<!-- npc-context:end -->
