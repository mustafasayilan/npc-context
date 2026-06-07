import { runCommand } from "./platform.js";
async function git(root, args, timeoutMs = 10_000) {
    const result = await runCommand("git", ["-C", root, ...args], { timeoutMs });
    return result.code === 0 ? result.stdout.trim() : "";
}
export async function getGitInfo(root) {
    const gitRoot = await git(root, ["rev-parse", "--show-toplevel"]);
    if (!gitRoot) {
        return {
            isRepository: false,
            changedFiles: [],
            untrackedFiles: [],
            recentBranches: [],
            statusShort: []
        };
    }
    const [branch, remote, changed, untracked, branches, status] = await Promise.all([
        git(root, ["branch", "--show-current"]),
        git(root, ["remote", "get-url", "origin"]),
        git(root, ["diff", "--name-only", "--diff-filter=ACMRTUXB", "HEAD"]),
        git(root, ["ls-files", "--others", "--exclude-standard"]),
        git(root, ["branch", "--sort=-committerdate", "--format=%(refname:short)"]),
        git(root, ["status", "--short", "--branch"])
    ]);
    return {
        isRepository: true,
        root: gitRoot,
        branch: branch || "(detached)",
        remote: remote || undefined,
        changedFiles: changed.split(/\r?\n/).filter(Boolean).sort(),
        untrackedFiles: untracked.split(/\r?\n/).filter(Boolean).sort(),
        recentBranches: branches.split(/\r?\n/).filter(Boolean).slice(0, 8),
        statusShort: status.split(/\r?\n/).filter(Boolean).slice(0, 80)
    };
}
//# sourceMappingURL=git.js.map