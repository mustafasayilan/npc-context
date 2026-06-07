# Minimum Requirements

## Required

- Node.js 18.18 or newer
- A writable project directory for project mode
- Windows 10+, Linux, WSL, or macOS

## Recommended

- Git, for branch and diff awareness
- ripgrep (`rg`), for faster file discovery

## Not Required

- Python
- pip or pipx
- GPU
- model API keys
- internet access during normal local scanning

## Resource Use

Typical use on ordinary repositories:

- memory: under 100 MB
- disk: a few MB in `.npc-context/`
- CPU: short burst during scanning

Very large monorepos can take longer. Runtime scales mainly with the number of candidate text/source files that are not ignored.

## Windows Notes

NPC Context uses Node.js filesystem APIs and avoids symlink-based setup. This makes project and global agent instruction setup work in PowerShell, Git Bash, Windows Terminal, and GUI-launched agent sessions.

## Linux Notes

No shell-specific install is required after Node.js is available. Git and ripgrep improve the experience but are not mandatory.
