# Contributing

Thanks for considering a contribution to VamaoLabs NPC Context.

## Development

```bash
npm install
npm run check
```

The CLI has no runtime dependencies. Keep it that way unless a dependency removes meaningful complexity and is safe for global installation.

## Design Rules

- Keep scanning local and deterministic.
- Do not send source code to external services.
- Do not modify application behavior during context generation.
- Keep generated context compact.
- Prefer cross-platform Node APIs over shell-specific behavior.
- Avoid symlinks for agent setup because they are fragile on Windows.

## Pull Requests

Before opening a pull request:

```bash
npm run check
npc-context benchmark --root tests/fixtures/sample-repo --prompt "add a simple settings panel"
```

By submitting a contribution, you agree that it is licensed under Apache-2.0 unless explicitly stated otherwise.

## Branding

Do not use VamaoLabs names, logos, or product names to imply that a fork or modified build is an official release. See [TRADEMARKS.md](TRADEMARKS.md).
