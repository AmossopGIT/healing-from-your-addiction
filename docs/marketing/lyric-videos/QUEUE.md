# Lyric video queue

**Category:** Addiction Recovery (`addiction-recovery`)

| Status | Published | Blog slug | Article title | Song slug | Notes |
|--------|-----------|-----------|---------------|-----------|-------|
| **done** | 2026-05-12 | `cross-addictions` | Cross-Addictions: When One Pattern Becomes Another | `cross-addictions-same-loop-new-name` | YouTube `jv9ML5VchMY`; loop-v5 masters |
| **next** | 2026-04-28 | `signs-of-behavioral-addictions` | Signs of Behavioral Addictions | _TBD_ | Song + loops not started |
| planned | 2026-04-26 | `signs-of-substance-addictions` | Signs of Substance Addictions | _TBD_ | After behavioral |

## Status keys

- **next** — Active production slot
- **planned** — Queued; create `campaigns/<slug>/` when starting
- **done** — Published; masters + social doc complete

## When starting a new row

1. Create `docs/marketing/lyric-videos/campaigns/<blog-slug>/` from `_template/`.
2. Copy `tools/lyric-video/_template.config.json` → `tools/lyric-video/<song-slug>.config.json`.
3. Store loops under `public/videos/loops/<blog-slug>/` (see `public/videos/README.md`).
4. Update this table and the campaign `CAMPAIGN.md` status.
