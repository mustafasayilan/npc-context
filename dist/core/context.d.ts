import type { ContextOptions, ContextResult, ProjectIndex } from "./types.js";
export declare function buildIndex(root: string, task: string): Promise<ProjectIndex>;
export declare function createContext(options: ContextOptions): Promise<ContextResult>;
