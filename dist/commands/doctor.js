import { join } from "node:path";
import { stat } from "node:fs/promises";
import { commandExists, canWrite, homePath } from "../core/platform.js";
import { pathExists } from "../core/fs-utils.js";
async function directoryExists(path) {
    try {
        return (await stat(path)).isDirectory();
    }
    catch {
        return false;
    }
}
export async function runDoctor(root) {
    const nodeMajor = Number(process.versions.node.split(".")[0]);
    const checks = [
        {
            name: "Node.js",
            ok: nodeMajor >= 18,
            detail: `Detected ${process.version}; minimum supported version is Node.js 18.18.`
        },
        {
            name: "Writable project",
            ok: await canWrite(root),
            detail: root
        },
        {
            name: "Git",
            ok: await commandExists("git"),
            detail: "Git is optional but recommended for branch and diff awareness."
        },
        {
            name: "ripgrep",
            ok: await commandExists("rg"),
            detail: "ripgrep is optional; NPC Context falls back to a built-in scanner."
        },
        {
            name: "Project instruction file",
            ok: (await pathExists(join(root, "AGENTS.md"))) || (await pathExists(join(root, "CLAUDE.md"))),
            detail: "Run `npc-context init --project --agent both` to install project instructions."
        },
        {
            name: "Global Codex instructions",
            ok: await pathExists(homePath(".codex", "AGENTS.md")),
            detail: homePath(".codex", "AGENTS.md")
        },
        {
            name: "Global Claude instructions",
            ok: await pathExists(homePath(".claude", "CLAUDE.md")),
            detail: homePath(".claude", "CLAUDE.md")
        },
        {
            name: "NPC workspace",
            ok: await directoryExists(join(root, ".npc-context")),
            detail: "Created automatically by context/init commands."
        }
    ];
    return checks;
}
//# sourceMappingURL=doctor.js.map