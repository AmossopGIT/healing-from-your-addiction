# Performance Reporting Workflow

## Cadence

- **Weekly:** quick check on spend, search terms, negatives, and lead quality signals.
- **Monthly:** full KPI snapshot and optimisation log update.

## File Naming

Store monthly outputs in `docs/marketing/data/performance/`:

- `YYYY-MM-performance.json` for account-level monthly report.
- Optional channel split: `YYYY-MM-search.json`, `YYYY-MM-pmax.json`, `YYYY-MM-shopping.json`.

## Source Template

Start each month by copying:

- `docs/marketing/data/performance/monthly-template.json`

Active gambling test snapshot:

- `docs/marketing/data/performance/2026-08-gambling-two-campaign-test.json`

## Required Monthly Fields

1. Reporting period dates.
2. Account summary metrics.
3. Per-campaign metric block.
4. Top search terms and negative additions.
5. Change log entries for optimisations.
6. Next action list with owner and due date.
7. Qualified leads and whether budget-increase rules were met.

## Budget Increase Gate (Gambling R800 Test)

Do not raise daily/monthly budget from clicks alone. After 30 days:

- Increase a campaign by 20–30% only when it has qualified enquiries and clean search terms.
- If both campaigns qualify, increase both by 20–30%.
- If a campaign spends without qualified enquiries, hold or reduce first, then add negatives and tighten message match.
- Reallocate toward the better qualified-lead rate and cost per qualified lead.

## Optimisation Logging Standard

Every meaningful change should be logged with:

- Date
- Campaign ID
- Change type (budget, bidding, keyword, negative, ad copy, asset, targeting)
- Short reason for change
- Expected impact

## Feedback Loop

- Apply learnings from `changeLog` and `nextActions` into each campaign Markdown brief and JSON payload version when updates are approved.
