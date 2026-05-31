# Campaign: <Article title>

| Field | Value |
|-------|--------|
| **Status** | planned \| next \| in-progress \| done |
| **Blog slug** | `<blog-slug>` |
| **URL** | https://www.healingfromyouraddiction.co.za/blog/<blog-slug>/ |
| **Published** | YYYY-MM-DD |
| **Category** | Addiction Recovery |
| **Hero art** | `blog-<art-id>` |
| **Song title** | <Song title> |
| **Song slug** | `<blog-slug>-<song-title-kebab>` |
| **YouTube** | _TBD_ (`<video-id>`) |

## Production

- **Audio:** `<path-to-wav>` (~<duration> s)
- **Lyrics:** `public/videos/<song-slug>-exact-v1.srt` (exact approved text only)
- **Config:** `tools/lyric-video/<song-slug>.config.json`
- **Render:** `powershell -ExecutionPolicy Bypass -File tools/render_lyric_video_loop.ps1 -Config tools/lyric-video/<song-slug>.config.json`

## Publish assets

| Asset | Path |
|-------|------|
| Horizontal | `public/videos/<song-slug>-horizontal-loop-v5.mp4` |
| Portrait | `public/videos/<song-slug>-portrait-loop-v5.mp4` |
| Thumbnail | `public/videos/<song-slug>-youtube-thumb.png` |
| Subtitles | `public/videos/<song-slug>-exact-v1.srt` |

## Loops

| Role | Path |
|------|------|
| Loop A | `public/videos/loops/<blog-slug>/loop-a.mp4` |
| Loop B | `public/videos/loops/<blog-slug>/loop-b.mp4` |

## Blog embed

Add to `content/blogArchiveChunk*.ts`:

```ts
video: {
  title: "<Section title>",
  youtubeId: "<id>",
}
```

## Social

See [`social-publishing.md`](./social-publishing.md).
