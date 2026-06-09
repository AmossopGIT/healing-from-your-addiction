# Social video export configs

One JSON file per **campaign slug**. Canonical scripts live in [`boilerplate/social-video-kit/`](../../boilerplate/social-video-kit/).

Requires finished loop-v5 masters from [lyric-video-kit](../../boilerplate/lyric-video-kit/README.md).

## Render all platform exports

```powershell
powershell -ExecutionPolicy Bypass -File boilerplate/social-video-kit/scripts/render_social_exports.ps1 `
  -Config tools/social-video/<campaign-slug>.campaign.json -ProjectRoot .
```

Or via npm:

```bash
npm run social:render -- -Config tools/social-video/cross-addictions.campaign.json
```

## Validate

```bash
npm run social:validate -- -Config tools/social-video/cross-addictions.campaign.json
```

## Safe-zone previews

```bash
npm run social:previews -- -Config tools/social-video/cross-addictions.campaign.json
```

## Config fields (highlights)

| Field | Purpose |
|-------|---------|
| `sources.horizontal` / `sources.portrait` | Loop-v5 master paths |
| `outputsDir` | Platform MP4s + `manifest.json` |
| `hooks[]` | Timed top-hook text; `burnIn` for FFmpeg overlay |
| `exports` | Per-platform enable, `variants: ["clean","hook"]`, `copyMaster` |

| Config | Campaign |
|--------|----------|
| `cross-addictions.campaign.json` | [Cross-Addictions](../../docs/marketing/lyric-videos/campaigns/cross-addictions/CAMPAIGN.md) |
| `_template` in kit | Copy from `boilerplate/social-video-kit/config/_template.campaign.json` |

Outputs: `public/videos/social/<campaign-slug>/`
