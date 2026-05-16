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

## Required Monthly Fields

1. Reporting period dates.
2. Account summary metrics.
3. Per-campaign metric block.
4. Top search terms and negative additions.
5. Change log entries for optimisations.
6. Next action list with owner and due date.

## Optimisation Logging Standard

Every meaningful change should be logged with:

- Date
- Campaign ID
- Change type (budget, bidding, keyword, negative, ad copy, asset, targeting)
- Short reason for change
- Expected impact

## Feedback Loop

- Apply learnings from `changeLog` and `nextActions` into each campaign Markdown brief and JSON payload version when updates are approved.
