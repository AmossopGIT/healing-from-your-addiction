# Thin wrapper — canonical: boilerplate/lyric-video-kit/scripts/sync_lyrics_from_config.ps1
param(
    [string]$Config = "",
    [Parameter(Mandatory = $false)]
    [string]$SongSlug = ""
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$KitScript = Join-Path $RepoRoot "boilerplate\lyric-video-kit\scripts\sync_lyrics_from_config.ps1"

if (-not $Config -and $SongSlug) {
    $Config = "tools/lyric-video/${SongSlug}.config.json"
}
if (-not $Config) {
    throw "Pass -Config tools/lyric-video/<song-slug>.config.json or -SongSlug <song-slug>"
}

if (-not (Test-Path $KitScript)) {
    throw "Kit sync script not found: $KitScript"
}

& $KitScript -Config $Config -ProjectRoot $RepoRoot
