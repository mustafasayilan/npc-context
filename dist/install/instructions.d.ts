import type { Agent } from "../core/types.js";
export declare const START_MARKER = "<!-- npc-context:start -->";
export declare const END_MARKER = "<!-- npc-context:end -->";
export declare function instructionBlock(agent: Agent, scope: "project" | "global"): string;
export declare function upsertBlock(existing: string, block: string): string;
