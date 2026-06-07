# Funding Setup

This repository is prepared for donations, but receiving money requires maintainer-side onboarding.

## Current Repository Setup

The repository includes:

```yaml
github: [mustafasayilan]
```

in `.github/FUNDING.yml`.

GitHub uses this file on the default branch to show a Sponsor button and funding links in the repository UI.

## How Donations Reach the Maintainer

To actually receive donations, the `mustafasayilan` GitHub account must complete GitHub Sponsors setup:

1. Enable two-factor authentication on GitHub.
2. Apply for or enable GitHub Sponsors for the account.
3. Complete the sponsored developer profile.
4. Create one-time or monthly sponsorship tiers.
5. Submit bank and tax information.
6. Complete Stripe Connect payout setup if GitHub requires it for the account.
7. Wait for GitHub approval, if approval is required.

After this is active, sponsors can use the GitHub Sponsor button and GitHub pays out through the configured payout account according to GitHub/Stripe payout rules.

## What Codex Cannot Do

Codex cannot complete this onboarding because it requires private financial, tax, identity, and payout information.

## Optional Alternatives

If GitHub Sponsors is not available or not desired, add a custom funding URL:

```yaml
github: [mustafasayilan]
custom:
  - https://vamaolabs.com/support
```

The custom URL can point to a VamaoLabs support page, Stripe Payment Link, Buy Me a Coffee, Open Collective, Patreon, or another donation provider.

## Notes

Donation income may have tax and accounting implications. This document is not legal, tax, or accounting advice.
