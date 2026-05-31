# Lyric video render configs

One JSON file per **song slug**. Canonical scripts live in [`boilerplate/lyric-video-kit/`](../../boilerplate/lyric-video-kit/); `tools/render_lyric_video_loop.ps1` is a thin wrapper.

## Render (sync + loops + masters)

```powershell
powershell -ExecutionPolicy Bypass -File tools/render_lyric_video_loop.ps1 `
  -Config tools/lyric-video/<song-slug>.config.json
```

Re-render without Whisper (`-SkipSync`):

```powershell
powershell -ExecutionPolicy Bypass -File tools/render_lyric_video_loop.ps1 `
  -Config tools/lyric-video/<song-slug>.config.json -SkipSync
```

Or via npm from repo root:

```bash
npm run video:render -- -Config tools/lyric-video/<song-slug>.config.json
npm run video:render -- -Config tools/lyric-video/<song-slug>.config.json -SkipSync
```

## Sync only

```powershell
powershell -ExecutionPolicy Bypass -File tools/sync_lyrics_whisper.ps1 -SongSlug <song-slug>
# or
npm run video:sync -- -Config tools/lyric-video/<song-slug>.config.json
```

## Validate paths

```powershell
npm run video:validate -- -Config tools/lyric-video/<song-slug>.config.json
```

## Config fields (highlights)

| Field | Purpose |
|-------|---------|
| `lyricsPath` | Plain lyrics for Whisper pipeline |
| `lyricSyncStart` | Draft SRT start (seconds), default 12 |
| `whisperModel` | e.g. `medium` |
| `skipLyricSync` | `true` when SRT is locked (like cross-addictions) |
| `loops` | Preferred: array of `{ file, download }` |
| `loopA` / `loopB` / `loopC` | Legacy two- or three-loop shorthand |

| Config | Campaign |
|--------|----------|
| `cross-addictions-same-loop-new-name.config.json` | [Cross-Addictions](../../docs/marketing/lyric-videos/campaigns/cross-addictions/CAMPAIGN.md) — 2 loops, manual SRT |
| `signs-of-behavioral-addictions-the-signs-of-my-trigger.config.json` | [Behavioral addictions](../../docs/marketing/lyric-videos/campaigns/signs-of-behavioral-addictions/CAMPAIGN.md) — 3 loops, Whisper sync |
| `_template.config.json` | Copy when starting a new song |

Shortcut for behavioral campaign:

```powershell
powershell -File tools/render_signs_of_behavioral_addictions.ps1 -SkipSync
```
