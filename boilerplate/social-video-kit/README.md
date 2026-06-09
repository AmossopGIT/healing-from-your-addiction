# Social video kit (portable boilerplate)

Copy this folder into any repo to turn **finished lyric-video masters** (horizontal 16:9 + portrait 9:16) into **platform-ready social exports** with optional top-hook burn-in, square/4:5 crops, safe-zone previews, and publishing templates.

**Stack:** FFmpeg only — no Whisper, no Remotion.

**Pairs with:** [`../lyric-video-kit/`](../lyric-video-kit/) for production (loops, sync, loop-v5 renders).

## Quick start

1. Install FFmpeg — see [SETUP.md](./SETUP.md).
2. Produce loop-v5 masters with lyric-video-kit (or place your own `*-horizontal-loop-v5.mp4` and `*-portrait-loop-v5.mp4`).
3. Copy `config/_template.campaign.json` → your project config path.
4. Copy `marketing/campaigns/_template/` → `marketing/campaigns/<campaign-slug>/`.
5. Render:

```powershell
powershell -ExecutionPolicy Bypass -File boilerplate/social-video-kit/scripts/render_social_exports.ps1 `
  -Config tools/social-video/<campaign-slug>.campaign.json `
  -ProjectRoot .
```

Validate first:

```powershell
powershell -ExecutionPolicy Bypass -File boilerplate/social-video-kit/scripts/validate_social_config.ps1 `
  -Config tools/social-video/<campaign-slug>.campaign.json `
  -ProjectRoot .
```

Safe-zone preview frames:

```powershell
powershell -ExecutionPolicy Bypass -File boilerplate/social-video-kit/scripts/generate_safe_zone_previews.ps1 `
  -Config tools/social-video/<campaign-slug>.campaign.json `
  -ProjectRoot .
```

## What it produces

| Output | Source | Notes |
|--------|--------|-------|
| YouTube / Facebook landscape / LinkedIn | Horizontal master | Copy (no re-encode) |
| TikTok / Reels / Shorts | Portrait master | `clean` copy + optional `hook` burn-in |
| Instagram / Facebook 1:1 | Portrait crop (top video pane) | Re-encoded crop |
| Instagram 4:5 | Portrait crop | Re-encoded crop |
| `manifest.json` | All exports | Paths, dimensions, hooks |
| `previews/*-safe-zone.png` | Frame grabs | Designer / native in-app placement |

## Config-driven pipeline

| Step | Script | Output |
|------|--------|--------|
| Validate | `validate_social_config.ps1` | Console report |
| Export | `render_social_exports.ps1` | Platform MP4s + manifest |
| Hook overlay | `apply_hook_overlay.ps1` | Called by render |
| Aspect crop | `crop_aspect.ps1` | Called by render |
| Safe zones | `generate_safe_zone_previews.ps1` | PNG guides |

Platform specs live in [`config/platforms.json`](./config/platforms.json). Per-campaign hooks, exports, and paths live in your campaign JSON.

## New project

1. Copy the entire `social-video-kit/` folder (e.g. `video-distribution/`).
2. Set `projectRoot` to `"."` in campaign config.
3. Point `sources.horizontal` and `sources.portrait` at your masters.
4. Set `outputsDir` (e.g. `assets/videos/social/<campaign>`).
5. Follow [marketing/workflow.md](./marketing/workflow.md).

## Directory map

| Path | Purpose |
|------|---------|
| `config/` | `platforms.json`, campaign templates |
| `scripts/` | Render, validate, crop, hook overlay, previews |
| `marketing/` | Workflow, platform specs, campaign templates |
| `assets/overlays/` | Optional overlay assets |
| `assets/fonts/` | Optional brand font files for drawtext |

## npm scripts (HFYA repo only)

```bash
npm run social:render -- -Config tools/social-video/cross-addictions.campaign.json
npm run social:validate -- -Config tools/social-video/cross-addictions.campaign.json
npm run social:previews -- -Config tools/social-video/cross-addictions.campaign.json
```

Pass script arguments after `--`.

## Reference campaign (HFYA)

- Config: `tools/social-video/cross-addictions.campaign.json`
- Example in kit: `config/example.cross-addictions.campaign.json`
- Outputs: `public/videos/social/cross-addictions/`
