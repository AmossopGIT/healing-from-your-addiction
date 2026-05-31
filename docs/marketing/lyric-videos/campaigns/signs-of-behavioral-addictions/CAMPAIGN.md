# Campaign: Signs of Behavioral Addictions

| Field | Value |
|-------|--------|
| **Status** | next |
| **Blog slug** | `signs-of-behavioral-addictions` |
| **URL** | https://www.healingfromyouraddiction.co.za/blog/signs-of-behavioral-addictions/ |
| **Published** | 2026-04-28 |
| **Category** | Addiction Recovery |
| **Hero art** | `blog-signs-of-behavioral-addictions` |
| **Song title** | _TBD_ |
| **Song slug** | _TBD_ (pattern: `<blog-slug>-<song-title-kebab>`) |
| **YouTube** | _TBD_ |

## Article hook (for lyrics / social)

> Behavioral (process) addictions don’t involve substances—but they activate the same reward system and follow the same loop: Trigger → Craving → Behavior → Reward.

## Checklist before render

- [ ] Suno (or other) master `.wav` in Downloads; note duration (seconds)
- [ ] Exact approved lyric text → `<song-slug>-exact-v1.srt`
- [ ] Whisper rough pass → manual sync in Aegisub → `exact-v1.ass`
- [ ] Two Midjourney seamless loops OR static watercolor hero + loop plan
- [ ] `tools/lyric-video/<song-slug>.config.json` from `_template.config.json`
- [ ] Loops in `public/videos/loops/signs-of-behavioral-addictions/`
- [ ] Render horizontal + portrait (`tools/render_lyric_video_loop.ps1`)
- [ ] QA: audio, lyrics in lower band (portrait), second chorus if applicable
- [ ] YouTube upload + thumbnail frame extract
- [ ] `social-publishing.md` from template
- [ ] Blog `section.video.youtubeId` in `content/blogArchiveChunk2.ts`
- [ ] Mark **done** in [`QUEUE.md`](../../QUEUE.md)

## Visual direction (draft)

- Reuse Addiction Recovery palette and watercolor system (`docs/art-style-guide.md`).
- Hero already shows figure + loop icons (dice, card, pause) — align loop clips or stills with that metaphor.
- Cross-link in copy to [cross-addictions](../cross-addictions/CAMPAIGN.md) where the shared loop is discussed.

## Social publishing

Create [`social-publishing.md`](./social-publishing.md) when masters are ready (copy from [`../_template/social-publishing.template.md`](../_template/social-publishing.template.md)).
