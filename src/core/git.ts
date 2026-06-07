import { runCommand } from "./platform.js";
import type { GitInfo } from "./types.js";

async function git(root: string, args: string[], timeoutMs = 10_000): Promise<string> {
  const result = await runCommand("git", ["-C", root, ...args], { timeoutMs });
  return result.code === 0 ? result.stdout.trim() : "";
}

export async function getGitInfo(root: string): Promise<GitInfo> {
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
