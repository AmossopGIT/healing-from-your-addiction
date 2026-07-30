# Phase 2 — PDF pack ingest map

After the gambling pilot is stable, replicate programme docs + templates from the Drive PDF pack.

Pack path (local reference): `c:\Users\amoss\Downloads\drive-download-20260730T063538Z-1-001\`

## Slug map (23 titles → internal slugs)

| PDF / pack title (approx) | Internal slug | Public status today | Batch |
|---|---|---|---|
| Gambling Addiction | `gambling` | active pillar | Pilot (done first) |
| Cannabis Addiction | `cannabis` | active | Batch A |
| Alcohol Addiction | `alcohol` | active | Batch A |
| Food / Binge Eating | `food-binge-eating` | active | Batch A |
| Nicotine / Smoking | `nicotine` | active | Batch A |
| Pornography | `pornography` | active | Batch B |
| Social Media | `social-media` | active | Batch B |
| Gaming | `gaming` | active | Batch B |
| Streaming / TV | `streaming-tv` | new | Batch B |
| Smartphone | `smartphone` | new | Batch B |
| Internet | `internet` | new | Batch B |
| Shopping | `shopping` | new | Batch C |
| Work | `work` | new | Batch C |
| Exercise | `exercise` | new | Batch C |
| Relationship | `relationship` | new | Batch C |
| Sex | `sex` | new | Batch C |
| Attention | `attention` | new | Batch C |
| Adrenaline | `adrenaline` | new | Batch C |
| Dopamine | `dopamine` | new | Batch C |
| Inhalants | `inhalants` | new | Batch D (high-risk last) |
| Opioids | `opioids` | new | Batch D |
| Prescription drugs | `prescription-drugs` | new | Batch D |
| Stimulants | `stimulants` | new | Batch D |

Batch order after gambling: **A → B → C → D**. Keep the site medical disclaimer visible for substance programmes.

## Replication checklist (per addiction)

1. Confirm PDF structure (overview, week guides, homework, scripts) and note gaps vs gambling pilot.
2. Add or activate entry in `content/programmes.ts` (+ SEO row in `content/seo.ts` / `docs/SEO_KEYWORDS.md` when public).
3. Ingest PDF copy into `content/programmeDocs/{slug}/` modules (HTML source of truth; PDF is import reference only).
4. Map Gerald’s scripts into case-study refs or session `content_ref` values.
5. Seed `programme_templates` + 8 `programme_sessions` + daily homework tasks via `seedProgrammeTemplates()` / addiction-specific builder.
6. Upsert `programme_docs` rows; verify admin release via `client_content_receipts` (`programme_doc`).
7. Select or create watercolor art; register in `content/artGallery.ts`.
8. Smoke-test: assign → schedule slot → homework ticks → doc HTML/PDF → recording URL → reminder cron.
9. Only then publish the public pillar page.

## Shared schema already in place

- `enrollment_schedules`, `session_progress.scheduled_at` / recordings
- `programme_homework_tasks`, `client_homework_entries`, `client_points_ledger`
- `programme_docs` + receipt kind `programme_doc`
- Meet URLs: `NEXT_PUBLIC_MEET_URL_11`, `NEXT_PUBLIC_MEET_URL_16`
- Cron: `/api/cron/homework-reminders/` (17:00 SAST ≈ 15:00 UTC)

## Non-goals until later

- Google Drive OAuth / service-account sync
- PayFast unlock
- Calendar free/busy capacity caps
