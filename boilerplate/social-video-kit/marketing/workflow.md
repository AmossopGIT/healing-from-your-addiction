# Social video distribution workflow

Turn loop-v5 masters into platform-ready exports and publish with consistent copy.

## Prerequisites

- Finished **horizontal** (`1920×1080`) and **portrait** (`1080×1920`) masters from [lyric-video-kit](../../lyric-video-kit/marketing/workflow.md) or equivalent
- FFmpeg installed — see [SETUP.md](../SETUP.md)
- Campaign config JSON filled from [`config/_template.campaign.json`](../config/_template.campaign.json)

## Five steps

### 1. Finish loop-v5 masters

Run lyric-video-kit render (or place masters at paths in `sources`):

- `<song-slug>-horizontal-loop-v5.mp4`
- `<song-slug>-portrait-loop-v5.mp4`

### 2. Copy campaign templates

```text
marketing/campaigns/_template/  →  marketing/campaigns/<campaign-slug>/
```

Fill:

- `CAMPAIGN.md` — production record
- `HOOKS.md` — hook text, timing, burn-in vs native
- `social-publishing.md` — platform titles and captions

### 3. Configure exports

Copy `config/_template.campaign.json` to your project (e.g. `tools/social-video/<campaign>.campaign.json`).

Set:

- `sources.horizontal` / `sources.portrait`
- `outputsDir` (e.g. `public/videos/social/<campaign-slug>`)
- `hooks[]` — timed top hooks for TikTok/Reels/Shorts
- `exports` — enable platforms you will post to

Validate:

```powershell
powershell -ExecutionPolicy Bypass -File boilerplate/social-video-kit/scripts/validate_social_config.ps1 `
  -Config tools/social-video/<campaign>.campaign.json -ProjectRoot .
```

### 4. Render exports

```powershell
powershell -ExecutionPolicy Bypass -File boilerplate/social-video-kit/scripts/render_social_exports.ps1 `
  -Config tools/social-video/<campaign>.campaign.json -ProjectRoot .
```

Optional safe-zone PNGs for designers:

```powershell
powershell -ExecutionPolicy Bypass -File boilerplate/social-video-kit/scripts/generate_safe_zone_previews.ps1 `
  -Config tools/social-video/<campaign>.campaign.json -ProjectRoot .
```

Check `manifest.json` in `outputsDir` for the file list.

### 5. Publish

Use `social-publishing.md` for copy-paste titles and captions.

| Platform | Typical file | Variant |
|----------|--------------|---------|
| YouTube | `*-youtube.mp4` | clean (horizontal copy) |
| TikTok / Reels / Shorts | `*-tiktok-clean.mp4` or `*-tiktok-hook.mp4` | clean for native text; hook for burn-in |
| Instagram feed 1:1 | `*-ig-square.mp4` | cropped from portrait video pane |
| Instagram feed 4:5 | `*-ig-4x5.mp4` | cropped from portrait video pane |

Follow [messaging-guardrails.md](./messaging-guardrails.md).

## Review checklist

- [ ] `manifest.json` lists every enabled platform
- [ ] Hook readable in safe zone on 9:16 preview PNG
- [ ] 1:1 / 4:5 crops keep loop artwork (no lyric band unless intended)
- [ ] Clean variants uploaded when adding native in-app hook text
- [ ] Captions match article positioning (no cure/guarantee claims)
