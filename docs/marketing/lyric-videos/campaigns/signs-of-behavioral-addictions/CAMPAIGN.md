# Campaign: Signs of Behavioral Addictions

| Field | Value |
|-------|--------|
| **Status** | in-progress (masters + Whisper-synced lyrics; YouTube pending) |
| **Blog slug** | `signs-of-behavioral-addictions` |
| **URL** | https://www.healingfromyouraddiction.co.za/blog/signs-of-behavioral-addictions/ |
| **Published** | 2026-04-28 |
| **Category** | Addiction Recovery |
| **Hero art** | `/art/watercolor/art-watercolor-blog-signs-of-behavioral-addictions.png` |
| **Song title** | **The Signs of My Trigger** |
| **Song slug** | `signs-of-behavioral-addictions-the-signs-of-my-trigger` |
| **YouTube** | _TBD_ |

## Lyrics

- [`lyrics.md`](./lyrics.md) — powered merge (*same reward, same loop* + deeper article coverage)  
- [`suno-paste.txt`](./suno-paste.txt) — Suno paste  

**Chorus hook:** *The signs of my trigger — same reward, same loop.*

## Suno brief (dark / sad)

Sad cinematic acoustic, **minor key**, 78–86 BPM, sparse piano or fingerpicked guitar, mournful strings. Soft tired vocal. **Trigger–gun metaphor** (click, hammer, smoke, shot) + **road / pause point** recovery image — not aggressive, not glorifying violence.

## Sync and render

```powershell
powershell -File tools/sync_lyrics_whisper.ps1 -SongSlug signs-of-behavioral-addictions-the-signs-of-my-trigger
powershell -File tools/render_signs_of_behavioral_addictions.ps1 -SkipSync
```

Whisper **medium** + line align + **phrase split** (~137 short cues on the beat, not static blocks).

**Background loops** (A -> B -> C, repeat): `loop-a.mp4`, `loop-b.mp4`, `loop-c.mp4` under `public/videos/loops/signs-of-behavioral-addictions/`.

## Next steps

1. QA portrait/horizontal on phone/desktop.
2. Optional: fine-tune in Aegisub using `...-exact-v1-aligned.srt`, re-run phrase split + `-SkipSync`.
3. YouTube upload → blog `youtubeId` + `social-publishing.md`.

## Publish assets (when ready)

| Asset | Path |
|-------|------|
| Horizontal | `public/videos/signs-of-behavioral-addictions-the-signs-of-my-trigger-horizontal-loop-v5.mp4` |
| Portrait | `public/videos/signs-of-behavioral-addictions-the-signs-of-my-trigger-portrait-loop-v5.mp4` |
| Thumbnail | `public/videos/signs-of-behavioral-addictions-the-signs-of-my-trigger-youtube-thumb.png` |
| Subtitles | `public/videos/signs-of-behavioral-addictions-the-signs-of-my-trigger-exact-v1.srt` |

## Checklist

- [x] Final lyrics — *The Signs of My Trigger*
- [x] Master WAV + Whisper-synced `exact-v1.srt`
- [x] Horizontal + portrait masters
- [ ] YouTube + `social-publishing.md` + blog `youtubeId`
