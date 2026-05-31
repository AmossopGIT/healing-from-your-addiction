# Campaign: Cross-Addictions

| Field | Value |
|-------|--------|
| **Status** | done |
| **Blog slug** | `cross-addictions` |
| **URL** | https://www.healingfromyouraddiction.co.za/blog/cross-addictions/ |
| **Published** | 2026-05-12 |
| **Category** | Addiction Recovery |
| **Song title** | Same Loop, New Name |
| **Song slug** | `cross-addictions-same-loop-new-name` |
| **YouTube** | https://youtu.be/jv9ML5VchMY (`jv9ML5VchMY`) |
| **Blog embed** | `content/blogArchiveChunk3.ts` → `section.video.youtubeId` |

## Production summary

- **Background:** Dual Midjourney loops (A→B alternating), `loop-v5` pipeline
- **Lyrics:** `exact-v1.srt` only (includes second chorus). Do **not** publish with `display-synced-v2.srt`
- **Audio source:** `C:\Users\amoss\Downloads\Same Loop, New Name.wav` (~226.16 s)
- **Render:** `powershell -ExecutionPolicy Bypass -File tools/render_lyric_video_loop.ps1 -Config tools/lyric-video/cross-addictions-same-loop-new-name.config.json`

## Publish assets (use these)

| Asset | Path |
|-------|------|
| Horizontal master | `public/videos/cross-addictions-same-loop-new-name-horizontal-loop-v5.mp4` |
| Portrait master | `public/videos/cross-addictions-same-loop-new-name-portrait-loop-v5.mp4` |
| YouTube thumbnail | `public/videos/cross-addictions-same-loop-new-name-youtube-thumb.png` |
| Exact subtitles | `public/videos/cross-addictions-same-loop-new-name-exact-v1.srt` |
| Alternating BG (intermediate) | `public/videos/cross-addictions-same-loop-new-name-bg-alternating.mp4` |

## Loop sources

| Role | Path |
|------|------|
| Loop A (right–left flow) | `public/videos/loops/cross-addictions-loop-right-left.mp4` |
| Loop B (yellow pause) | `public/videos/loops/cross-addictions-loop-yellow-pause.mp4` |
| Prepped A / B | `*-prepped.mp4` (same folder; 8px bottom crop, 30 fps) |

_New campaigns:_ move loops to `public/videos/loops/cross-addictions/` when reorganizing disk.

## Draft / archive (do not publish)

Older iterations kept for reference; safe to delete locally if space is tight:

- `*-horizontal-synced*.mp4`, `*-portrait-synced*.mp4`
- `*-horizontal-exact-v4.mp4`, `*-portrait-exact-v4.mp4`
- `*-display-synced-v2.srt` (shortened lyrics)
- `cross-addictions-*-test*.mp4`, `*-preview.png` (except loop-v5 previews)
- `*-bg-alternating.concat-full.mp4`

## Portrait style (final)

- Top half: video `1080×960` on cream `#f7f3ea`
- Lyrics: `FontSize=17`, `MarginV=48`, bottom alignment, `-map "[v]" -map 1:a`
- Re-render portrait only: `tools/render_cross_addictions_portrait_only.ps1`

## Social publishing

Copy and platform titles: [`social-publishing.md`](./social-publishing.md)

## Lessons for next campaign

1. Lock **exact** lyric `.srt` before final render; never swap in display-shortened subs.
2. Portrait FFmpeg must output labeled `[v]` and map audio explicitly.
3. Blog uses **YouTube embed** for play count; MP4s are for TikTok/Reels/Facebook uploads only.
4. YouTube thumbnail = frame from horizontal master (~42–46 s), not blog hero art.
