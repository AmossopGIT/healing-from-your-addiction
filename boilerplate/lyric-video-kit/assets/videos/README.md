# Video assets (kit layout)

Use these paths when `videosDir` in config is `assets/videos` (new projects). HFYA keeps publish masters at `public/videos/` for stable site URLs.

## Per song slug

| File | Purpose |
|------|---------|
| `<song-slug>-exact-v1.srt` | Approved lyrics + sync (publish render) |
| `<song-slug>-exact-v1.ass` | Aegisub working file |
| `<song-slug>-bg-alternating.mp4` | Intermediate A→B loop concat |
| `<song-slug>-horizontal-loop-v5.mp4` | YouTube / Facebook / web |
| `<song-slug>-portrait-loop-v5.mp4` | TikTok / Reels / Stories |
| `<song-slug>-youtube-thumb.png` | YouTube studio thumbnail |

## Do not publish

- `*-display-synced*.srt` — shortened draft lines
- `*-synced-v2.mp4` and other experiment exports unless promoted to `-loop-v5`

## Loops

Store sources under `assets/loops/<blog-slug>/loop-a.mp4` and `loop-b.mp4`. Render script writes `-prepped.mp4` beside them.

## Transcripts

Whisper JSON under `assets/transcripts/<song-slug>.json`.
