# Lyrics source — <Song title>

**Campaign:** [CAMPAIGN.md](./CAMPAIGN.md)  
**Song slug:** `<blog-slug>-<song-title-kebab>`

Single checklist linking approved text, sung audio, Whisper, and publish subtitles.

## 1. Lock lyrics (source of truth)

| Field | Value |
|-------|--------|
| **File** | `LYRICS.md` (this folder) or `lyrics.txt` |
| **Approved** | YYYY-MM-DD |
| **Rule** | SRT lines must match this file exactly — no paraphrase, no omitted choruses |

## 2. Lock voice (master audio)

| Field | Value |
|-------|--------|
| **File** | `assets/audio/<song>.wav` (or path in config `audioPath`) |
| **Generator** | Suno / other: _name_ |
| **Duration** | _seconds_ (must match config `duration`) |
| **Notes** | _vocal style, version_

## 3. Display subtitles (exact)

| Field | Value |
|-------|--------|
| **Publish SRT** | `<videosDir>/<song-slug>-exact-v1.srt` |
| **Working ASS** | `<song-slug>-exact-v1.ass` |
| **Do not publish** | `*-display-synced*.srt` (shortened drafts) |

Build initial SRT from `LYRICS.md` in display order with placeholder timings.

## 4. Whisper transcript

```bash
whisper <audio-path> --model medium --output_format json --output_dir assets/transcripts
```

| Field | Value |
|-------|--------|
| **JSON path** | `assets/transcripts/<song-slug>.json` |
| **Requires** | `segments[].words[]` with `word`, `start`, `end` |

## 5. Auto-align (rough pass)

```bash
python boilerplate/lyric-video-kit/scripts/align_lyrics_whisper.py ^
  --input-srt <exact-v1.srt> ^
  --transcript-json assets/transcripts/<song-slug>.json ^
  --output-srt <exact-v1-aligned.srt>
```

Review output; merge into `exact-v1` when satisfied.

## 6. Manual pass (Aegisub)

- Open `exact-v1.ass` (or import SRT + audio).
- Nudge cues to musical beat.
- Export final `exact-v1.srt` for render.

## 7. Text verification (before render)

Every cue on screen must match `LYRICS.md`. Fill after final SRT:

| Cue # | Line in LYRICS.md | Line in exact-v1.srt | Match? |
|-------|-------------------|----------------------|--------|
| 1 | | | Y / N |
| 2 | | | |
| … | | | |

**Second chorus / bridge present?** Y / N  
**Any shortened display-sync draft used by mistake?** N

## 8. Render

Config: `config/<song-slug>.config.json` → horizontal + portrait `*-loop-v5.mp4`.

## 9. Post-render QA

- [ ] Audio length matches video end
- [ ] Intro, chorus, bridge, outro timed acceptably
- [ ] Horizontal and portrait both reviewed
- [ ] Social copy follows [messaging-guardrails.md](../../messaging-guardrails.md)
