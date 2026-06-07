import type { AgentSelection, InstallScope } from "../core/types.js";
export interface InstallResult {
    files: string[];
    gitignoreUpdated: boolean;
}
export declare function installInstructions(root: string, scope: InstallScope, agentSelection: AgentSelection): Promise<InstallResult>;
