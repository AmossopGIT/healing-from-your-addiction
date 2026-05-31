# Video assets

## Layout

```
public/videos/
  README.md
  campaigns/              # Per-blog indexes (paths may point to files here at root)
    <blog-slug>/
      README.md
  loops/                  # Seamless loop sources (+ -prepped)
    <blog-slug>/          # Preferred for new campaigns
    cross-addictions-*.mp4  # Legacy flat names (cross-addictions)
  <song-slug>-*.mp4       # Publish masters & subtitles at repo root (stable URLs)
```

**Publish masters** stay at `public/videos/<song-slug>-*` so site paths like `/videos/...` do not break.

**New campaigns:** put loop sources in `public/videos/loops/<blog-slug>/` and add `public/videos/campaigns/<blog-slug>/README.md` listing all files.

## File types (per song slug)

| Suffix | Purpose |
|--------|---------|
| `-exact-v1.srt` / `.ass` | Approved lyrics + sync (use for final render) |
| `-display-synced*.srt` | Draft/shortened — do not publish |
| `-bg-alternating.mp4` | Concat A→B background (intermediate) |
| `-horizontal-loop-v5.mp4` | YouTube / Facebook / blog backup |
| `-portrait-loop-v5.mp4` | TikTok / Reels / Stories |
| `-youtube-thumb.png` | YouTube studio thumbnail |

## Campaign index

| Blog slug | Song slug | Doc |
|-----------|-----------|-----|
| `cross-addictions` | `cross-addictions-same-loop-new-name` | [`campaigns/cross-addictions/README.md`](./campaigns/cross-addictions/README.md) |

## Docs

- Hub: [`docs/marketing/lyric-videos/README.md`](../../docs/marketing/lyric-videos/README.md)
- Queue: [`docs/marketing/lyric-videos/QUEUE.md`](../../docs/marketing/lyric-videos/QUEUE.md)
- FFmpeg workflow: [`docs/marketing/framework/lyric-video-production-workflow.md`](../../docs/marketing/framework/lyric-video-production-workflow.md)
