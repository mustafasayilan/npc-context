export declare function isDependencyTask(task: string): boolean;
export declare function isCandidate(root: string, relativePath: string, dependencyTask: boolean): Promise<boolean>;
export declare function discoverFiles(root: string, task: string): Promise<string[]>;
