# Setup — social video kit

## Required tools

| Tool | Purpose | Check |
|------|---------|--------|
| **ffmpeg** | Copy, crop, hook overlay encode | `ffmpeg -version` |
| **ffprobe** | Read video dimensions / duration | `ffprobe -version` |

No Python or Whisper required.

## One-command export (recommended)

Fill `config/<campaign>.campaign.json` (or copy `_template.campaign.json`) with:

- `sources.horizontal` and `sources.portrait` — loop-v5 masters from lyric-video-kit
- `outputsDir` — where platform files land
- `hooks[]` — optional timed top-hook text
- `exports` — which platforms to enable

From project root:

```powershell
powershell -ExecutionPolicy Bypass -File boilerplate/social-video-kit/scripts/render_social_exports.ps1 `
  -Config config/<campaign>.campaign.json `
  -ProjectRoot .
```

## Validate before encode

```powershell
powershell -ExecutionPolicy Bypass -File boilerplate/social-video-kit/scripts/validate_social_config.ps1 `
  -Config config/<campaign>.campaign.json `
  -ProjectRoot .
```

## Safe-zone previews

```powershell
powershell -ExecutionPolicy Bypass -File boilerplate/social-video-kit/scripts/generate_safe_zone_previews.ps1 `
  -Config config/<campaign>.campaign.json `
  -ProjectRoot .
```

Writes PNGs under `<outputsDir>/previews/`.

## PowerShell execution policy

If scripts are blocked:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Or invoke with `-ExecutionPolicy Bypass` (see README).

## Hook styling (defaults in campaign `brand`)

- White text (`#FFFFFF`)
- Gold outline (`#a87727`)
- Portrait hooks: top safe band (~14% from top on 9:16)
- Horizontal hooks: top band with side margins

Override `hookFont`, `hookFontSizePortrait`, `hookFontSizeHorizontal` in campaign config. Place a `.ttf` in `assets/fonts/` and set `hookFontFile` in `brand` if Arial is unavailable on your system.

## Inputs

This kit expects **finished** masters:

- `<song-slug>-horizontal-loop-v5.mp4` (1920×1080)
- `<song-slug>-portrait-loop-v5.mp4` (1080×1920)

Produce them with [lyric-video-kit](../lyric-video-kit/README.md) or supply your own files at the paths in config.
