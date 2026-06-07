import { spawn } from "node:child_process";
import { access, mkdir, rm, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { delimiter } from "node:path";
import { homedir } from "node:os";
import { dirname, extname, join, resolve } from "node:path";
export function normalizePath(value) {
    return value.replace(/\\/g, "/");
}
export function resolveRoot(root) {
    return resolve(root || ".");
}
export function homePath(...parts) {
    return resolve(homedir(), ...parts);
}
export async function ensureParent(path) {
    await mkdir(dirname(path), { recursive: true });
}
export async function canWrite(path) {
    const root = resolve(path);
    const probe = join(root, `.npc-context-write-test-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    try {
        await writeFile(probe, "ok", "utf8");
        await rm(probe, { force: true });
        return true;
    }
    catch {
        await rm(probe, { force: true }).catch(() => undefined);
        return false;
    }
}
export async function commandExists(command) {
    const pathValue = process.env.PATH ?? "";
    const directories = pathValue.split(delimiter).filter(Boolean);
    const extensions = process.platform === "win32"
        ? (process.env.PATHEXT ?? ".EXE;.CMD;.BAT;.COM").split(";").filter(Boolean)
        : [""];
    const names = extname(command) ? [command] : extensions.map((extension) => `${command}${extension}`);
    const mode = process.platform === "win32" ? constants.F_OK : constants.X_OK;
    for (const directory of directories) {
        for (const name of names) {
            try {
                await access(join(directory, name), mode);
                return true;
            }
            catch {
                // Try the next PATH candidate.
            }
        }
    }
    return false;
}
export function runCommand(command, args, options = {}) {
    return new Promise((resolveResult) => {
        const child = spawn(command, args, {
            cwd: options.cwd,
            shell: false,
            windowsHide: true
        });
        let stdout = "";
        let stderr = "";
        const timeout = setTimeout(() => {
            child.kill("SIGTERM");
        }, options.timeoutMs ?? 10_000);
        child.stdout.setEncoding("utf8");
        child.stderr.setEncoding("utf8");
        child.stdout.on("data", (chunk) => {
            stdout += chunk;
        });
        child.stderr.on("data", (chunk) => {
            stderr += chunk;
        });
        child.on("error", (error) => {
            clearTimeout(timeout);
            resolveResult({ code: 127, stdout, stderr: String(error.message || error) });
        });
        child.on("close", (code) => {
            clearTimeout(timeout);
            resolveResult({ code, stdout, stderr });
        });
    });
}
//# sourceMappingURL=platform.js.map