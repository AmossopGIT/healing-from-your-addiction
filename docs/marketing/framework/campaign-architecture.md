# Campaign Architecture

## System Design

One addiction topic should map to one campaign family, with intent-driven ad groups and dedicated landing page alignment.

## Canonical Pattern

1. **Campaign** = addiction topic + channel + geography (or a tightly scoped intent split within one topic when budgets are small).
2. `Ad Group` = single intent cluster.
3. `Keywords` = tightly matched to ad group intent.
4. `Ads` = copy aligned to intent and guardrails.
5. `Landing Page` = dedicated topic page with matching language.
6. `Tracking` = standard conversion events and UTM structure.

## Current gambling Search pattern (R800 test)

For the month-one gambling test, one topic is intentionally split into **two campaigns** so spend and qualified-lead quality can be compared:

- `HFYA | Search | Stop Gambling | ZA`
- `HFYA | Search | Gambling Treatment | ZA`

Both share the same landing page: `/addictions/gambling-addiction-help/`.

See [`docs/marketing/campaigns/search/gambling-two-campaign-launch.md`](../campaigns/search/gambling-two-campaign-launch.md).

## Why This Scales

- New topics can be added without restructuring existing campaigns.
- Search, Performance Max, and Shopping can share naming and data models.
- Optimisation stays clean because intent data is not mixed across unrelated behaviours.

## Channel Expansion

- `Search`: intent-led ad groups and RSA variants.
- `Performance Max`: asset groups mapped by topic and audience signal.
- `Shopping`: feed/listing groups for relevant offerings when applicable.
