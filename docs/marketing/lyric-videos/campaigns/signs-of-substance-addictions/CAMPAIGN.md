# Campaign: Signs of Substance Addictions

| Field | Value |
|-------|--------|
| **Status** | in-progress (lyrics approved; Suno WAV + video pending) |
| **Blog slug** | `signs-of-substance-addictions` |
| **URL** | https://www.healingfromyouraddiction.co.za/blog/signs-of-substance-addictions/ |
| **Published** | 2026-04-26 |
| **Category** | Addiction Recovery |
| **Hero art** | `/art/watercolor/art-watercolor-blog-signs-of-substance-addictions.png` |
| **Song title** | **What the Body Asks For** |
| **Song slug** | `signs-of-substance-addictions-what-the-body-asks-for` |
| **YouTube** | _TBD_ (`<video-id>`) |
| **Blog embed** | `content/blogArchiveChunk2.ts` → add `section.video.youtubeId` |

## Lyrics

- [`lyrics.md`](./lyrics.md) — powered merge (physical dependence + substance-specific signs + medical safety)  
- [`suno-paste.txt`](./suno-paste.txt) — Suno paste  

**Chorus hook:** *What the body asks for — not the flood, just the shore.*

## Suno brief (dark / sad)

Sad cinematic acoustic, **minor key**, 78–86 BPM, sparse piano or fingerpicked guitar, mournful strings. Soft tired vocal. **River/undertow + broken ring + glass moon + smoke** metaphor (hero art) — not glorifying use; bridge names alcohol/benzodiazepine medical supervision.

**Style prompt (Suno):** Sad cinematic acoustic, minor key, 78 BPM, sparse piano, fingerpicked guitar, mournful cello, room reverb, soft male or female vocal, intimate and heavy, no drums, grief not aggression.

## Sync and render (after WAV)

```powershell
powershell -File tools/sync_lyrics_whisper.ps1 -SongSlug signs-of-substance-addictions-what-the-body-asks-for
powershell -ExecutionPolicy Bypass -File tools/render_lyric_video_loop.ps1 -Config tools/lyric-video/signs-of-substance-addictions-what-the-body-asks-for.config.json
```

Whisper **medium** + line align + **phrase split** (same pipeline as behavioral campaign).

**Background loops** (A → B → C, repeat): `loop-a.mp4`, `loop-b.mp4`, `loop-c.mp4` under `public/videos/loops/signs-of-substance-addictions/` (source from hero-art–matched Midjourney clips).

## Next steps

1. Generate master in Suno from [`suno-paste.txt`](./suno-paste.txt) → save WAV as `What the Body Asks For.wav`.
2. Update `audioPath` + `duration` in `tools/lyric-video/signs-of-substance-addictions-what-the-body-asks-for.config.json`.
3. Add loop clips under `public/videos/loops/signs-of-substance-addictions/`.
4. Run Whisper sync + loop-v5 render; QA portrait/horizontal.
5. YouTube upload → fill `<video-id>` in [`social-publishing.md`](./social-publishing.md) + blog `youtubeId`.

## Social

See [`social-publishing.md`](./social-publishing.md).

## Publish assets (when ready)

| Asset | Path |
|-------|------|
| Horizontal | `public/videos/signs-of-substance-addictions-what-the-body-asks-for-horizontal-loop-v5.mp4` |
| Portrait | `public/videos/signs-of-substance-addictions-what-the-body-asks-for-portrait-loop-v5.mp4` |
| Thumbnail | `public/videos/signs-of-substance-addictions-what-the-body-asks-for-youtube-thumb.png` |
| Subtitles | `public/videos/signs-of-substance-addictions-what-the-body-asks-for-exact-v1.srt` |

## Checklist

- [x] Final lyrics — *What the Body Asks For*
- [ ] Master WAV + Whisper-synced `exact-v1.srt`
- [ ] Background loops (hero-matched watercolor)
- [ ] Horizontal + portrait masters
- [ ] `social-publishing.md` (YouTube ID)
- [ ] Blog `youtubeId` + lyric-video section in `blogArchiveChunk2.ts`

## Sister campaign

Paired with [Signs of Behavioral Addictions — *The Signs of My Trigger*](../signs-of-behavioral-addictions/CAMPAIGN.md): behavioral = trigger/road metaphor; substance = broken circle/glass/withdrawal weight.
