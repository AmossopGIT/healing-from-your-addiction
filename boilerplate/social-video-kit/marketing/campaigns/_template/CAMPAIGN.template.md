# <Article title> — Social distribution

**Campaign slug:** `<campaign-slug>`  
**Song slug:** `<song-slug>`  
**Blog:** `https://<your-domain>/blog/<blog-slug>/`

## Sources (loop-v5 masters)

| Asset | Path |
|-------|------|
| Horizontal | `<videosDir>/<song-slug>-horizontal-loop-v5.mp4` |
| Portrait | `<videosDir>/<song-slug>-portrait-loop-v5.mp4` |

## Social exports

**Config:** `tools/social-video/<campaign-slug>.campaign.json`  
**Outputs:** `<outputsDir>/`  
**Manifest:** `<outputsDir>/manifest.json`

## Hooks

See [HOOKS.md](./HOOKS.md).

## Publishing

See [social-publishing.md](./social-publishing.md).

## Render commands

```powershell
powershell -ExecutionPolicy Bypass -File boilerplate/social-video-kit/scripts/render_social_exports.ps1 `
  -Config tools/social-video/<campaign-slug>.campaign.json -ProjectRoot .
```
