# Blog Lyric Videos

Source of truth for **blog-song lyric videos**: production, file layout, publishing, and per-article campaign records.

Paid Search/PMax docs live in `docs/marketing/campaigns/search/`. This tree is only for organic video + blog embeds.

## Directory map

| Path | Purpose |
|------|---------|
| [`QUEUE.md`](./QUEUE.md) | Pipeline: done, in progress, next (Addiction Recovery series) |
| [`campaigns/<blog-slug>/`](./campaigns/) | One folder per blog article |
| [`../framework/lyric-video-production-workflow.md`](../framework/lyric-video-production-workflow.md) | FFmpeg defaults, loop-v5 layout, review checklist |
| [`../../public/videos/README.md`](../../public/videos/README.md) | On-disk video and subtitle paths |
| [`../../tools/lyric-video/`](../../tools/lyric-video/) | Per-song JSON config + render entry script |
| [`../../boilerplate/lyric-video-kit/`](../../boilerplate/lyric-video-kit/) | **Portable boilerplate** — copy to new projects (scripts, templates, workflow) |

## Naming (every campaign)

| Concept | Example | Rule |
|---------|---------|------|
| **Blog slug** | `cross-addictions` | Matches `content/blog*.ts` `slug` |
| **Song slug** | `cross-addictions-same-loop-new-name` | `<blog-slug>-<song-title-kebab>` |
| **Publish masters** | `<song-slug>-horizontal-loop-v5.mp4` | Under `public/videos/` (stable URLs) |
| **Loops** | `public/videos/loops/<blog-slug>/` | Source + `-prepped` clips (new campaigns) |

## Per-campaign workflow

**New external project:** copy [`boilerplate/lyric-video-kit/`](../../boilerplate/lyric-video-kit/) wholesale; use kit `marketing/campaigns/_template/` and `config/_template.config.json`.

1. Copy [`campaigns/_template/`](./campaigns/_template/) → `campaigns/<blog-slug>/` (HFYA in-repo).
2. Fill `CAMPAIGN.md` (article, song, audio path, duration, art/loops).
3. Add `tools/lyric-video/<song-slug>.config.json`.
4. Produce exact `.srt` / `.ass` → render → QA → fill `social-publishing.md`.
5. Upload YouTube; set `youtubeId` on blog `section.video` in `content/blogArchiveChunk*.ts`.
6. Post portrait to TikTok/Reels; horizontal to YouTube/Facebook.
7. Mark row **done** in `QUEUE.md`.

## Completed campaigns

- [Cross-Addictions](./campaigns/cross-addictions/CAMPAIGN.md) — *Same Loop, New Name* (2026-05-12)

## Next

- [Signs of Behavioral Addictions](./campaigns/signs-of-behavioral-addictions/CAMPAIGN.md) — *The Signs of My Trigger* (WAV/video pending) · 2026-04-28
