# Naming Conventions

## Campaign Names

Use:

- `HFYA | Search | <Topic> | ZA`
- `HFYA | PMax | <TopicOrPortfolio> | ZA`
- `HFYA | Shopping | <FeedSegment> | ZA`

Examples:

- `HFYA | Search | Gambling Addiction | ZA`
- `HFYA | Search | Food Addiction | ZA`

## Ad Group Names

Use concise intent labels:

- `Stop Gambling Help`
- `Online Gambling and Betting Help`
- `Problem Gambling Support`
- `Gambling Hypnotherapy`
- `Emotional Eating Support`
- `Stress Eating Support`
- `Binge Eating Support`
- `Food Addiction Support`

## File Names

- Markdown: lowercase, hyphen-separated (for example `food-addiction.md`).
- JSON campaign payloads: `<channel>-<topic>.<geo>.json` (for example `search-food-addiction.za.json`).
- Negative lists: `shared.json` and topic-specific files.

## Version Fields

In JSON, include:

- `version` using semantic style (`1.0.0`).
- `lastUpdated` in ISO date format.
- `status` (`draft`, `active`, `paused`, `archived`).
