# Platform specs and safe zones

Canonical dimensions live in [`config/platforms.json`](../config/platforms.json). This doc explains how to place **top hooks** and what each export is for.

## Master → platform map

| Platform key | Size | Aspect | Source | Export action |
|--------------|------|--------|--------|---------------|
| `youtube` | 1920×1080 | 16:9 | Horizontal master | Copy |
| `facebook_landscape` | 1920×1080 | 16:9 | Horizontal master | Copy |
| `linkedin` | 1920×1080 | 16:9 | Horizontal master | Copy |
| `tiktok` | 1080×1920 | 9:16 | Portrait master | Clean copy + optional hook burn-in |
| `instagram_reels` | 1080×1920 | 9:16 | Portrait master | Clean copy + optional hook burn-in |
| `youtube_shorts` | 1080×1920 | 9:16 | Portrait master | Clean copy + optional hook burn-in |
| `facebook_reels` | 1080×1920 | 9:16 | Portrait master | Clean copy + optional hook burn-in |
| `instagram_feed_square` | 1080×1080 | 1:1 | Portrait (crop top pane) | Re-encode crop |
| `instagram_feed_portrait` | 1080×1350 | 4:5 | Portrait (crop top pane) | Re-encode crop |
| `facebook_square` | 1080×1080 | 1:1 | Portrait (crop top pane) | Re-encode crop |

## Safe zones (hook placement)

Percentages are from each edge of the **final export frame**. Hook text should sit in the green band on safe-zone preview PNGs.

### 9:16 (TikTok, Reels, Shorts)

- **Top UI band:** ~14% — profile, follow, caption chrome
- **Bottom UI band:** ~22% — likes, comments, share, sound
- **Hook placement:** centered in top safe band (~14–18% from top)
- **Lyrics:** stay in existing bottom cream band from loop-v5 portrait — do not move

Use `*-clean.mp4` when adding hook text **in the native app** (CapCut, TikTok editor). Use `*-hook.mp4` when burning hook via FFmpeg.

### 16:9 (YouTube, Facebook landscape, LinkedIn)

- **Top band:** ~8% — optional thin hook
- **Bottom band:** ~12% — player controls / lower-third lyrics
- Hooks are optional on horizontal; most campaigns use title + description only

### 1:1 and 4:5 (feed posts)

- Crop from portrait **video pane** (`crop 1080×1080` or `1080×1350` at `y=0`)
- Default **excludes** lyric cream band — artwork stays visible
- Set `"includeLyricBand": true` in export config if you want lyrics in feed crops

## Variants: clean vs hook

| Variant | File suffix | When to use |
|---------|-------------|-------------|
| `clean` | `*-tiktok-clean.mp4` | Native in-app text; maximum flexibility |
| `hook` | `*-tiktok-hook.mp4` | Burned-in hook for first ~3.5s |

Document both in `HOOKS.md` even if you only publish one variant.

## Native in-app text tips

- **TikTok:** Add hook in first 1–2 seconds; keep under ~60 characters for readability
- **Reels:** Same hook line; use Instagram text tool in top safe band
- **Shorts:** Title in YouTube Studio + optional in-frame text matching `HOOKS.md`

Reference safe-zone PNGs: `<outputsDir>/previews/<platform>-safe-zone.png`
