# Interactive programme platform

The programme platform turns the source affirmation packs into versioned, trackable client journeys while keeping the source content distinguishable from additional interactive exercises.

## Client journey

- Clients receive an immutable programme snapshot when they are enrolled.
- Daily activities support mood, urge level, pause taken, practice completion, and optional private notes.
- Progress is saved server-side and resumes across devices.
- The portal shows completion percentage, current activity, weekly module progress, live-session progress, points, and a recent progress timeline.
- High-urge responses create a server-confirmed safety event and show calm support guidance.

Preview mode is intentionally isolated: admin previews use the real activity wizard, but answers remain in browser memory and never become client results or analytics.

## Admin operations

The admin programme view provides:

- At-a-glance completion, saved-result, shared-answer, and daily-check-in counts.
- Activity-by-activity status and visible answers.
- A progress event timeline sourced from durable server events.
- Mood and urge pulse history.
- Admin flags for support, inactivity, notes, and safety follow-up.
- Draft editing, source comparison, validation, review status, version history, and publish controls.
- A source-review queue for human content and safety approval.

Private answers are stored separately and are only returned to admins when the client has explicitly shared them. Query failures are surfaced as data warnings so an empty panel is not mistaken for missing client activity.

## Data and reporting

Migration `018_close_programme_platform_gaps.sql` adds:

- `programme_versions`
- `programme_activity_events`
- `client_activity_private_answers`
- public response columns and programme review/cadence metadata

Server events are the progress source of truth. Browser analytics are consent-aware observations only. Events are idempotent through `idempotency_key`.

Admin reporting supports programme filters, date filters, activity drop-off, inactive clients, safety events, and CSV export at:

`/api/admin/programmes/export/`

## Scheduling

Live-session dates are generated from the published programme cadence. Daily interactive activities and optional live coaching sessions are treated as separate tracks. Completed and past sessions are protected when future schedules are changed.

## Source and review policy

- Source activities retain `origin: "source"`.
- Additional interactive exercises retain `origin: "platform"`.
- Each definition stores its source filename, excerpt, checksum, review status, and structure manifest.
- OCR-derived content retains its OCR provenance even after wording review.
- Substance and OCR programmes require explicit human review before final approval.

## Verification

Useful checks:

```text
npm run programmes:validate
npx vitest run lib/programme/interactive/interactiveProgrammes.test.ts
npx tsc --noEmit
npx next build
```

The trio smoke checks cover a behavioral programme (`gambling`), a substance programme (`alcohol`), and an OCR programme (`cannabis`) across source structure, daily check-in fields, published database snapshots, version rows, preview resolution, and cadence scheduling.
