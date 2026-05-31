# Cross-addictions loop-v5 render (wrapper). Prefer config-driven render for new work.
$ErrorActionPreference = "Stop"
& (Join-Path $PSScriptRoot "render_lyric_video_loop.ps1") -Config (Join-Path $PSScriptRoot "lyric-video/cross-addictions-same-loop-new-name.config.json")
