# Setup — lyric video kit

## Required tools

| Tool | Purpose | Check |
|------|---------|--------|
| **ffmpeg** | Encode masters, burn subtitles | `ffmpeg -version` |
| **ffprobe** | Audio/loop duration | `ffprobe -version` |
| **Python 3** | Align, draft SRT, phrase split, loop builders | `python --version` |
| **openai-whisper** (pip) | Word-level transcript JSON | `python -c "import whisper"` |
| **Aegisub** (optional) | Manual musical sync on `.ass` | Default: `C:\Program Files\Aegisub\aegisub.exe` |

Install Whisper for Python:

```bash
pip install openai-whisper
```

## One-command render (recommended)

Fill `config/<song-slug>.config.json` with `lyricsPath`, `audioPath`, `loops` (or `loopA`/`loopB`), and `srt` output path. From project root:

```powershell
powershell -ExecutionPolicy Bypass -File boilerplate/lyric-video-kit/scripts/render_lyric_video_loop.ps1 `
  -Config config/<song-slug>.config.json `
  -ProjectRoot .
```

The render script runs **sync → prep loops → background → horizontal + portrait** unless you pass `-SkipSync` or set `"skipLyricSync": true` (use when the publish SRT is already locked).

## Sync only

```powershell
powershell -ExecutionPolicy Bypass -File boilerplate/lyric-video-kit/scripts/sync_lyrics_from_config.ps1 `
  -Config config/<song-slug>.config.json `
  -ProjectRoot .
```

Produces:

- `<song-slug>-exact-v1-draft.srt` — even spacing from plain lyrics
- `<song-slug>-transcript.json` — Whisper with word timestamps
- `<song-slug>-exact-v1-aligned.srt` — word-matched to audio
- `<song-slug>-exact-v1.srt` — phrase-split publish file

Tune `lyricSyncStart` (default 12) and optional `lyricSyncEnd` in config if the intro is longer or shorter.

## Manual align (optional)

If you skip auto-sync and build SRT by hand, or after Aegisub:

```bash
python boilerplate/lyric-video-kit/scripts/align_lyrics_whisper.py ^
  --input-srt assets/videos/<song-slug>-exact-v1-draft.srt ^
  --transcript-json assets/videos/<song-slug>-transcript.json ^
  --output-srt assets/videos/<song-slug>-exact-v1-aligned.srt
```

Review in Aegisub; export final `exact-v1.srt` to the path in config.

## PowerShell execution policy

If scripts are blocked:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Or invoke with `-ExecutionPolicy Bypass` (see README).

## Brand subtitle styling (defaults in render script)

- White text, gold outline (`#a87727` in ASS BGR)
- Horizontal: full bleed 1920×1080, subs at bottom (`FontSize=16`, `MarginV=24`)
- Portrait: loop in top 1080×960, cream `#f7f3ea` band below (`FontSize=17`, `MarginV=48`)

## Background loops

| Loop count | Builder | Typical output |
|------------|---------|----------------|
| 2 | `build_alternating_loop_bg.py` | `<song>-bg-alternating.mp4` |
| 3+ | `build_multi_loop_bg.py` | `<song>-bg-loop.mp4` |

Override filename with `"backgroundOutput": "my-custom-bg.mp4"` in config.
