# Marketing Campaign Documentation

This directory is the source of truth for paid media campaign planning, build details, and performance tracking for Healing From Your Addiction.

## Scope

- Campaign strategy and guardrails in Markdown.
- Build-ready campaign payloads in JSON.
- Shared assets and negative keyword libraries.
- Monthly performance snapshots and optimisation notes.

## Directory Map

- `governance/` - Messaging constraints and launch compliance checklist.
- `framework/` - Campaign architecture, naming, lifecycle workflow, and reporting workflow.
- `lyric-videos/` - Blog-song lyric video queue, per-article campaigns, and social publishing copy.
- `campaigns/search/` - Human-readable campaign briefs for Search campaigns.
- `assets/` - Shared ad assets used across campaigns.
- `negatives/` - Human-readable negative keyword lists.
- `data/campaigns/` - Machine-readable campaign payloads.
- `data/negatives/` - Machine-readable negative keyword lists.
- `data/performance/` - Reporting templates and monthly outputs.
- `templates/` - Reusable JSON templates for new campaigns.

## Active gambling Search launch (Aug 2026)

Two-campaign R800 month-one test:

- Launch guide: [`campaigns/search/gambling-two-campaign-launch.md`](campaigns/search/gambling-two-campaign-launch.md)
- Stop Gambling: [`campaigns/search/stop-gambling.md`](campaigns/search/stop-gambling.md) + [`data/campaigns/search-stop-gambling.za.json`](data/campaigns/search-stop-gambling.za.json)
- Gambling Treatment: [`campaigns/search/gambling-treatment.md`](campaigns/search/gambling-treatment.md) + [`data/campaigns/search-gambling-treatment.za.json`](data/campaigns/search-gambling-treatment.za.json)
- Canonical landing page: `https://healingfromyouraddiction.co.za/addictions/gambling-addiction-help/`

## Operating Principle

Use both formats together:

- Update Markdown when strategy, positioning, or policy changes.
- Update JSON when campaign build fields, assets, keywords, negatives, or results change.
- Keep both in sync so account decisions remain auditable and scalable.
