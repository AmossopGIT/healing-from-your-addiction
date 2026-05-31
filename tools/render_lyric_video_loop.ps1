# Thin wrapper — canonical: boilerplate/lyric-video-kit/scripts/render_lyric_video_loop.ps1
param(
    [Parameter(Mandatory = $true)]
    [string]$Config,
    [switch]$SkipSync
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$KitScript = Join-Path $RepoRoot "boilerplate\lyric-video-kit\scripts\render_lyric_video_loop.ps1"

if (-not (Test-Path $KitScript)) {
    throw "Kit render script not found: $KitScript"
}

$params = @{
    Config       = $Config
    ProjectRoot  = $RepoRoot
}
if ($SkipSync) {
    $params.SkipSync = $true
}

& $KitScript @params
