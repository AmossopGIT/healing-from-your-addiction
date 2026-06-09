# <Article title> — On-screen hooks

**Campaign:** [CAMPAIGN.md](./CAMPAIGN.md)

Safe-zone previews: `<outputsDir>/previews/<platform>-safe-zone.png`

## Hook: main-hook

| Field | Value |
|-------|-------|
| **Text** | _Your hook line_ |
| **Timing** | 0s – 3.5s |
| **Position** | Top safe band (9:16) |
| **Burn-in platforms** | TikTok, Instagram Reels, YouTube Shorts, Facebook Reels |
| **Native-only platforms** | _(list any where you add text in-app instead)_ |

### Burn-in file

`<song-slug>-tiktok-hook.mp4` (and matching `*-instagram-reels-hook.mp4`, etc.)

### Native in-app

Use `*-tiktok-clean.mp4` and add the same hook text in the app editor within the green safe zone on the preview PNG.

## Optional second hook

| Field | Value |
|-------|-------|
| **Text** | |
| **Timing** | |
| **Platforms** | |

## QA

- [ ] Hook readable on phone at arm's length
- [ ] Does not overlap TikTok/Reels UI chrome
- [ ] Does not cover lyric cream band on portrait master
