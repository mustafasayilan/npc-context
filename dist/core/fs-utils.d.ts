export declare function pathExists(path: string): Promise<boolean>;
export declare function readText(path: string): Promise<string>;
export declare function readTextIfExists(path: string): Promise<string>;
export declare function writeText(path: string, value: string): Promise<void>;
export declare function sha1(value: string): string;
export declare function relativePosix(root: string, path: string): string;
export declare function walkFiles(root: string, skipDir: (name: string) => boolean): Promise<string[]>;
export declare function ensureGitignore(root: string, extraLines?: string[]): Promise<boolean>;
export declare function utcNow(): string;
