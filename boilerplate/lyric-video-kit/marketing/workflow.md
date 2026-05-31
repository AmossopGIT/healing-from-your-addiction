# Lyric video workflow (loop-v5)

One blog article + one master audio → **horizontal** (1920×1080) + **portrait** (1080×1920) + exact subtitles.

## Non-negotiables

- Use **exact approved lyrics** in the publish SRT (no shortening unless explicitly approved).
- Export **both** horizontal and portrait in one render run.
- Publish with `*-exact-v1.srt` only — not `*-display-synced*`.
- Follow [messaging-guardrails.md](./messaging-guardrails.md) for social copy.

## Pipeline (config-driven)

| Step | Output | Tool |
|------|--------|------|
| 1. Lock lyrics | `LYRICS.md`, `suno-paste.txt` | Human |
| 2. Master audio | `*.wav` | Suno or other; set `audioPath` |
| 3. Config | `<song-slug>.config.json` | Copy `_template.config.json` |
| 4. Auto-sync | `*-exact-v1.srt` | `sync_lyrics_from_config.ps1` (or render without `-SkipSync`) |
| 5. Aegisub (optional) | Fine-tune from `*-exact-v1-aligned.srt` | Musical sync |
| 6. Loops | `loop-a.mp4`, … under `loopsDir` | Midjourney / stock; `download` paths in config |
| 7. Render | `*-horizontal-loop-v5.mp4`, `*-portrait-loop-v5.mp4` | `render_lyric_video_loop.ps1` |

Whisper steps inside sync: **draft SRT → transcript JSON → align → phrase split** (comma/dash splits for on-beat cues).

## Loop-v5 layout

| Format | Video | Lyrics |
|--------|-------|--------|
| Horizontal | Full bleed 1920×1080 | Bottom, `FontSize=16`, `MarginV=24` |
| Portrait | Top 1080×960 on cream `#f7f3ea` | Bottom cream band, `FontSize=17`, `MarginV=48` |

Background:

- **Two loops:** A → B → A → B … (`build_alternating_loop_bg.py`)
- **Three or more:** A → B → C → A → B → C … (`build_multi_loop_bg.py`)

## Render command

From project root:

```powershell
powershell -ExecutionPolicy Bypass -File boilerplate/lyric-video-kit/scripts/render_lyric_video_loop.ps1 `
  -Config tools/lyric-video/<song-slug>.config.json `
  -ProjectRoot .
```

Re-render masters only (existing SRT, skip Whisper):

```powershell
... -SkipSync
```

Validate paths before a long encode:

```powershell
powershell -ExecutionPolicy Bypass -File boilerplate/lyric-video-kit/scripts/validate_lyric_video_config.ps1 `
  -Config tools/lyric-video/<song-slug>.config.json -ProjectRoot .
```

## Review checklist

- [ ] On-screen text matches approved lyrics exactly (including all choruses).
- [ ] Timing feels synced through intro, chorus, bridge, outro.
- [ ] Horizontal and portrait play correctly on desktop and phone.
- [ ] Gold stroke readable on white text.
- [ ] Stable output names under your `videosDir`.
