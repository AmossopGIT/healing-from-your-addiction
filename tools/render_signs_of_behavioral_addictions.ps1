# Thin wrapper — The Signs of My Trigger (see tools/lyric-video/*.config.json).
param([switch]$SkipSync)

$ErrorActionPreference = "Stop"
$Config = "tools/lyric-video/signs-of-behavioral-addictions-the-signs-of-my-trigger.config.json"
$Render = Join-Path $PSScriptRoot "render_lyric_video_loop.ps1"

$params = @{ Config = $Config }
if ($SkipSync) { $params.SkipSync = $true }

& $Render @params
