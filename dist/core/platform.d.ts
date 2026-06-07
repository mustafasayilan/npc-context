export interface CommandResult {
    code: number | null;
    stdout: string;
    stderr: string;
}
export declare function normalizePath(value: string): string;
export declare function resolveRoot(root: string): string;
export declare function homePath(...parts: string[]): string;
export declare function ensureParent(path: string): Promise<void>;
export declare function canWrite(path: string): Promise<boolean>;
export declare function commandExists(command: string): Promise<boolean>;
export declare function runCommand(command: string, args: string[], options?: {
    cwd?: string;
    timeoutMs?: number;
}): Promise<CommandResult>;
