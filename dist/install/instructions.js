export const START_MARKER = "<!-- npc-context:start -->";
export const END_MARKER = "<!-- npc-context:end -->";
function commandFor(agent) {
    return `npc-context context "<user task>" --root . --agent ${agent}`;
}
export function instructionBlock(agent, scope) {
    const title = scope === "global" ? "VamaoLabs NPC Context Global Workflow" : "VamaoLabs NPC Context";
    const contextPath = ".npc-context/task-context.md";
    const legacyNote = agent === "codex"
        ? "A compatibility copy may also be written to `.codex-npc/task-context.md` for older Codex instructions."
        : "";
    return [
        START_MARKER,
        `## ${title}`,
        "",
        "Before development work in any repository:",
        "",
        `1. Run \`${commandFor(agent)}\` before opening or searching project files.`,
        `2. Read \`${contextPath}\` and start with the targeted paths, symbols, routes, dependency hints, and git diff paths listed there.`,
        "3. Expand file reads only when the task requires it; avoid generated, dependency, build, cache, and binary directories.",
        "4. Refresh the NPC context after meaningful edits.",
        "5. NPC bootstrap may create only `.npc-context/`, optional compatibility context folders, and gitignore protection. It must not modify application behavior.",
        legacyNote ? `6. ${legacyNote}` : "",
        "",
        "If the command is not available on PATH, install it from the project README or run it through your package manager before continuing.",
        END_MARKER
    ]
        .filter(Boolean)
        .join("\n");
}
export function upsertBlock(existing, block) {
    const start = existing.indexOf(START_MARKER);
    const end = existing.indexOf(END_MARKER);
    if (start >= 0 && end > start) {
        const before = existing.slice(0, start).trimEnd();
        const after = existing.slice(end + END_MARKER.length).trimStart();
        return [before, block, after].filter(Boolean).join("\n\n") + "\n";
    }
    const prefix = existing.trimEnd();
    return `${prefix ? `${prefix}\n\n` : ""}${block}\n`;
}
//# sourceMappingURL=instructions.js.map