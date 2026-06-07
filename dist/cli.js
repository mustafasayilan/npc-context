#!/usr/bin/env node
import { resolve } from "node:path";
import { createContext } from "./core/context.js";
import { runBenchmark } from "./core/benchmark.js";
import { formatNumber } from "./core/token-estimator.js";
import { installInstructions } from "./install/adapters.js";
import { runDoctor } from "./commands/doctor.js";
function parseArgs(argv) {
    const [command = "help", ...rest] = argv;
    const positionals = [];
    const options = {};
    for (let index = 0; index < rest.length; index += 1) {
        const item = rest[index] ?? "";
        if (!item.startsWith("--")) {
            positionals.push(item);
            continue;
        }
        const [rawKey, inlineValue] = item.slice(2).split("=", 2);
        const key = rawKey.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
        if (inlineValue !== undefined) {
            options[key] = inlineValue;
        }
        else if (rest[index + 1] && !rest[index + 1]?.startsWith("--")) {
            options[key] = rest[index + 1] ?? "";
            index += 1;
        }
        else {
            options[key] = true;
        }
    }
    return { command, positionals, options };
}
function optionString(options, name, fallback = "") {
    const value = options[name];
    return typeof value === "string" ? value : fallback;
}
function optionBoolean(options, name) {
    return options[name] === true || options[name] === "true";
}
function agentOption(options) {
    const value = optionString(options, "agent", "both");
    if (["codex", "claude", "generic", "both"].includes(value))
        return value;
    throw new Error(`Unsupported agent: ${value}`);
}
function scopeOption(options) {
    if (optionBoolean(options, "global"))
        return "global";
    if (optionBoolean(options, "project"))
        return "project";
    const value = optionString(options, "scope", "project");
    if (value === "project" || value === "global")
        return value;
    throw new Error(`Unsupported scope: ${value}`);
}
function help() {
    return `
VamaoLabs NPC Context

Usage:
  npc-context init --project --agent both
  npc-context install --global --agent both
  npc-context context "fix login bug" --root .
  npc-context benchmark --prompt "add a settings page" --root .
  npc-context doctor --root .

Commands:
  init       Install project or global agent instructions.
  install    Alias for init; useful with --global.
  context    Generate .npc-context/task-context.md for a task.
  benchmark  Compare broad-scan token estimates with NPC context output.
  doctor     Check platform, tools, and instruction files.
  help       Show this message.

Options:
  --root <path>       Project directory. Default: .
  --agent <value>     codex, claude, generic, or both. Default: both.
  --project           Install instructions in the current project.
  --global            Install user-level instructions.
  --prompt <text>     Benchmark prompt.
  --max-files <n>     Maximum relevant files in context. Default: 20.
  --json              Print JSON output when supported.
  --no-legacy         Do not mirror context to .codex-npc/task-context.md.
`.trim();
}
async function main() {
    const parsed = parseArgs(process.argv.slice(2));
    const root = resolve(optionString(parsed.options, "root", "."));
    const json = optionBoolean(parsed.options, "json");
    if (parsed.command === "help" || parsed.command === "--help" || parsed.command === "-h") {
        console.log(help());
        return 0;
    }
    if (parsed.command === "context") {
        const task = parsed.positionals.join(" ").trim() || optionString(parsed.options, "task", "");
        const result = await createContext({
            root,
            task,
            agent: agentOption(parsed.options) === "both" ? "generic" : agentOption(parsed.options),
            maxFiles: Number(optionString(parsed.options, "maxFiles", "20")),
            mirrorCodexLegacy: !optionBoolean(parsed.options, "noLegacy")
        });
        if (json) {
            console.log(JSON.stringify({
                contextPath: result.contextPath,
                legacyContextPath: result.legacyContextPath,
                indexedFiles: Object.keys(result.index.files).length,
                selectedFiles: result.selectedFiles.map((file) => file.path),
                estimatedContextTokens: result.estimatedContextTokens
            }, null, 2));
        }
        else {
            console.log(`NPC context: ${result.contextPath}`);
            if (result.legacyContextPath)
                console.log(`Codex compatibility context: ${result.legacyContextPath}`);
            console.log(`Indexed files: ${formatNumber(Object.keys(result.index.files).length)}`);
            console.log(`Selected files: ${formatNumber(result.selectedFiles.length)}`);
            console.log(`Estimated context tokens: ${formatNumber(result.estimatedContextTokens)}`);
        }
        return 0;
    }
    if (parsed.command === "init" || parsed.command === "install") {
        const scope = scopeOption(parsed.options);
        const result = await installInstructions(root, scope, agentOption(parsed.options));
        if (json) {
            console.log(JSON.stringify(result, null, 2));
        }
        else {
            console.log(`Installed ${scope} instructions:`);
            for (const file of result.files)
                console.log(`- ${file}`);
            if (result.gitignoreUpdated)
                console.log("- Updated .gitignore for NPC helper files");
        }
        return 0;
    }
    if (parsed.command === "benchmark") {
        const prompt = optionString(parsed.options, "prompt", parsed.positionals.join(" ").trim());
        if (!prompt)
            throw new Error("benchmark requires --prompt or positional prompt text");
        const result = await runBenchmark(root, prompt);
        if (json) {
            console.log(JSON.stringify(result, null, 2));
        }
        else {
            console.log(`Baseline estimated tokens: ${formatNumber(result.baselineEstimatedTokens)}`);
            console.log(`NPC Context estimated tokens: ${formatNumber(result.npcContextEstimatedTokens)}`);
            console.log(`Estimated savings: ${result.estimatedSavingsPercent}%`);
            console.log("Results written to .npc-context/benchmark-results.*");
        }
        return 0;
    }
    if (parsed.command === "doctor") {
        const checks = await runDoctor(root);
        if (json) {
            console.log(JSON.stringify(checks, null, 2));
        }
        else {
            for (const check of checks) {
                console.log(`${check.ok ? "OK" : "WARN"} ${check.name}: ${check.detail}`);
            }
        }
        return checks.every((check) => check.ok || ["Git", "ripgrep", "Project instruction file", "Global Codex instructions", "Global Claude instructions", "NPC workspace"].includes(check.name)) ? 0 : 1;
    }
    console.error(`Unknown command: ${parsed.command}`);
    console.error(help());
    return 1;
}
main().then((code) => {
    process.exitCode = code;
}, (error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
});
//# sourceMappingURL=cli.js.map