# Campaign: <Article title>

| Field | Value |
|-------|--------|
| **Status** | planned \| next \| in-progress \| done |
| **Blog slug** | `<blog-slug>` |
| **Site URL** | `https://<your-domain>/blog/<blog-slug>/` |
| **Published** | YYYY-MM-DD |
| **Category** | _e.g. Addiction Recovery_ |
| **Song title** | <Song title> |
| **Song slug** | `<blog-slug>-<song-title-kebab>` |
| **YouTube** | _TBD_ (`<video-id>`) |

## Lyrics and audio

See [LYRICS-SOURCE.md](./LYRICS-SOURCE.md).

- **Audio:** `<path-to-wav>` (~<duration> s)
- **Lyrics:** `<videosDir>/<song-slug>-exact-v1.srt` (exact approved text only)
- **Config:** `config/<song-slug>.config.json` (or `tools/lyric-video/` in HFYA)

## Render

```powershell
powershell -ExecutionPolicy Bypass -File boilerplate/lyric-video-kit/scripts/render_lyric_video_loop.ps1 `
  -Config <path-to-config.json> `
  -ProjectRoot .
```

## Publish assets

| Asset | Path |
|-------|------|
| Horizontal | `<videosDir>/<song-slug>-horizontal-loop-v5.mp4` |
| Portrait | `<videosDir>/<song-slug>-portrait-loop-v5.mp4` |
| Thumbnail | `<videosDir>/<song-slug>-youtube-thumb.png` |
| Subtitles | `<videosDir>/<song-slug>-exact-v1.srt` |

## Loops

| Role | Path |
|------|------|
| Loop A | `<loopsDir>/loop-a.mp4` |
| Loop B | `<loopsDir>/loop-b.mp4` |

## Site embed (optional)

```ts
video: {
  title: "<Section title>",
  youtubeId: "<id>",
}
```

## Social

See [`social-publishing.md`](./social-publishing.md).
