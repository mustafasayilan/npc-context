# Release and Branch Strategy

The repository uses a simple public open-source workflow.

## Branches

- `main`: stable development and release branch
- feature branches: short-lived branches for pull requests

No long-running `develop` branch is required until release volume justifies it.

## Versioning

NPC Context uses semantic versioning:

- patch: bug fixes and documentation improvements
- minor: compatible feature additions
- major: breaking CLI, output, or instruction changes

## Release Checklist

```bash
npm ci
npm run check
npm audit --omit=dev
npm run benchmark:sample
```

Then:

```bash
npm version patch
git push --follow-tags
```

When the `@vamaolabs` npm scope is available:

```bash
npm publish --access public
```

## GitHub Actions

A Windows/Linux CI template is available at `docs/github-actions-ci.yml`.

To enable it, copy it to `.github/workflows/ci.yml` with a GitHub token that has permission to create workflow files.
