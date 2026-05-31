# Lyric video kit (portable boilerplate)

Copy this folder into a new repo (or keep it under `boilerplate/lyric-video-kit/`) to produce **horizontal** (1920×1080) and **portrait** (1080×1920) lyric videos with FFmpeg, Whisper, and optional Aegisub fine-tuning.

**Stack:** FFmpeg + Whisper + Aegisub — not Remotion.

## Quick start

1. Install dependencies — see [SETUP.md](./SETUP.md).
2. Copy `marketing/campaigns/_template/` → `marketing/campaigns/<blog-slug>/`.
3. Copy `config/_template.config.json` → your config path and fill paths.
4. Lock lyrics in `LYRICS.md` / `suno-paste.txt`; set `lyricsPath` in config.
5. Render (sync + loops + masters in one run):

```powershell
powershell -ExecutionPolicy Bypass -File boilerplate/lyric-video-kit/scripts/render_lyric_video_loop.ps1 `
  -Config tools/lyric-video/<song-slug>.config.json `
  -ProjectRoot .
```

Re-render without re-running Whisper:

```powershell
... -SkipSync
```

On **Healing from Your Addiction**, `tools/render_lyric_video_loop.ps1` is a thin wrapper with `-ProjectRoot` set automatically.

## Config-driven pipeline

| Step | Script | Output |
|------|--------|--------|
| Draft SRT | `lyrics_to_draft_srt.py` | `<song>-exact-v1-draft.srt` |
| Whisper | `transcribe_song_whisper.py` | `<song>-transcript.json` |
| Align | `align_lyrics_whisper.py` | `<song>-exact-v1-aligned.srt` |
| Phrase split | `phrase_split_srt.py` | `<song>-exact-v1.srt` (publish) |
| Background | `build_alternating_loop_bg.py` (2 loops) or `build_multi_loop_bg.py` (3+) | `*-bg-alternating.mp4` or `*-bg-loop.mp4` |
| Masters | `render_lyric_video_loop.ps1` | `*-horizontal-loop-v5.mp4`, `*-portrait-loop-v5.mp4` |

Sync only (no encode):

```powershell
powershell -ExecutionPolicy Bypass -File boilerplate/lyric-video-kit/scripts/sync_lyrics_from_config.ps1 `
  -Config tools/lyric-video/<song-slug>.config.json -ProjectRoot .
```

## Loops in config

**Preferred:** `loops` array (2 or more clips, played in order and repeated):

```json
"loops": [
  { "file": "loop-a.mp4", "download": "C:\\path\\to\\source-a.mp4" },
  { "file": "loop-b.mp4", "download": "" }
]
```

**Legacy:** `loopA` / `loopB` / optional `loopC` + `loop*Download` still work.

## New project

1. Copy the entire `lyric-video-kit/` folder into your new repo (e.g. `video-kit/`).
2. Work from that repo root; set `projectRoot` to `"."` in config.
3. Use `assets/videos`, `assets/loops`, `assets/audio` (see `assets/videos/README.md`).
4. Follow [marketing/workflow.md](./marketing/workflow.md).

## Directory map

| Path | Purpose |
|------|---------|
| `config/` | Per-song JSON (`_template.config.json`, `example.config.json`) |
| `scripts/` | Render, sync, align, retime, loop builders |
| `marketing/` | Workflow, guardrails, campaign templates |
| `assets/` | Placeholder layout for videos, loops, transcripts |

## npm scripts (HFYA repo only)

```bash
npm run video:render -- -Config tools/lyric-video/<song-slug>.config.json
npm run video:sync -- -Config tools/lyric-video/<song-slug>.config.json
npm run video:validate -- -Config tools/lyric-video/<song-slug>.config.json
```

Pass script arguments after `--`.

## Reference campaigns (HFYA)

- Cross-addictions (2 loops, manual SRT): `tools/lyric-video/cross-addictions-same-loop-new-name.config.json`
- Behavioral addictions (3 loops, Whisper sync): `tools/lyric-video/signs-of-behavioral-addictions-the-signs-of-my-trigger.config.json`
