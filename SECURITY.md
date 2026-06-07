# Security

## Reporting

Please report security issues privately instead of opening a public issue.

Use the GitHub Security Advisory flow if available, or contact the maintainers through the repository owner profile.

## Security Model

NPC Context is local-only:

- it does not call LLM APIs
- it does not upload source code
- it does not require API keys
- it does not execute files from the target repository
- it does not modify application behavior while generating context

It does write helper files and agent instruction files when requested. Review generated files before committing them.

## Sensitive Files

NPC Context tries to avoid generated, dependency, cache, binary, and large files. It is not a secrets scanner and does not guarantee that sensitive text files will never be summarized. Keep secrets out of repositories and configure your own ignore rules when needed.
