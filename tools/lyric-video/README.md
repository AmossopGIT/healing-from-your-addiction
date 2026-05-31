# Lyric video render configs

One JSON file per **song slug**. Render with:

```powershell
powershell -ExecutionPolicy Bypass -File tools/render_lyric_video_loop.ps1 -Config tools/lyric-video/<song-slug>.config.json
```

| Config | Campaign |
|--------|----------|
| `cross-addictions-same-loop-new-name.config.json` | [Cross-Addictions](../../docs/marketing/lyric-videos/campaigns/cross-addictions/CAMPAIGN.md) |
| `_template.config.json` | Copy when starting a new song |

Portrait-only re-render (no loop rebuild): `tools/render_cross_addictions_portrait_only.ps1` (cross-addictions today; generalize when needed).
