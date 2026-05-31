# Validates a lyric video config: JSON parse, path resolution, required files.
# Usage: ... -Config tools/lyric-video/<song>.config.json [-ProjectRoot .]

param(
    [Parameter(Mandatory = $true)]
    [string]$Config,
    [string]$ProjectRoot = ""
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$KitRoot = Split-Path -Parent $ScriptDir

function Resolve-ConfigPath {
    param([string]$Path, [string]$Root)
    if ([System.IO.Path]::IsPathRooted($Path)) {
        if (-not (Test-Path $Path)) { throw "Config not found: $Path" }
        return (Resolve-Path $Path).Path
    }
    $fromCwd = Join-Path (Get-Location) $Path
    if (Test-Path $fromCwd) { return (Resolve-Path $fromCwd).Path }
    if ($Root) {
        $fromRoot = Join-Path $Root $Path
        if (Test-Path $fromRoot) { return (Resolve-Path $fromRoot).Path }
    }
    throw "Config not found: $Path"
}

function Resolve-ProjectPath {
    param([string]$Root, [string]$Path)
    if ([string]::IsNullOrWhiteSpace($Path)) { return $null }
    if ([System.IO.Path]::IsPathRooted($Path)) { return $Path }
    return (Join-Path $Root $Path)
}

function Get-ConfigLoops {
    param($Config)
    $entries = @()
    if ($Config.PSObject.Properties.Name -contains "loops" -and $Config.loops) {
        foreach ($item in $Config.loops) {
            $entries += $item.file
        }
    } else {
        foreach ($key in @("loopA", "loopB", "loopC")) {
            if ($Config.PSObject.Properties.Name -contains $key -and $Config.$key) {
                $entries += $Config.$key
            }
        }
    }
    return $entries
}

$initialRoot = if ($ProjectRoot) { (Resolve-Path $ProjectRoot).Path } else { (Get-Location).Path }
$configPath = Resolve-ConfigPath -Path $Config -Root $initialRoot
$c = Get-Content $configPath -Raw | ConvertFrom-Json

if ($ProjectRoot) {
    $Root = (Resolve-Path $ProjectRoot).Path
} elseif ($c.PSObject.Properties.Name -contains "projectRoot" -and $c.projectRoot -and $c.projectRoot -ne ".") {
    $configDir = Split-Path $configPath -Parent
    $Root = (Resolve-Path (Join-Path $configDir $c.projectRoot)).Path
} else {
    $configDir = Split-Path $configPath -Parent
    if ($configDir -match '[\\/]lyric-video$') {
        $Root = (Resolve-Path (Join-Path $configDir "..\..")).Path
    } elseif ($configDir -match '[\\/]config$') {
        $Root = (Resolve-Path (Join-Path $configDir "..")).Path
    } else {
        $Root = (Get-Location).Path
    }
}

$VideosDir = if ($c.videosDir) { $c.videosDir } else { "public/videos" }
$loopsDir = Resolve-ProjectPath $Root $c.loopsDir
$loopFiles = Get-ConfigLoops -Config $c

$checks = @(
    @{ Name = "projectRoot"; Path = $Root; Required = $true },
    @{ Name = "audio"; Path = (Resolve-ProjectPath $Root $c.audioPath); Required = $true }
)

if ($c.lyricsPath) {
    $checks += @{ Name = "lyricsPath"; Path = (Resolve-ProjectPath $Root $c.lyricsPath); Required = $false }
}

$needsSrt = -not $c.lyricsPath -or $c.skipLyricSync
if ($needsSrt) {
    $checks += @{ Name = "srt"; Path = (Resolve-ProjectPath $Root $c.srt); Required = $true }
} else {
    $checks += @{ Name = "srt (generated on render)"; Path = (Resolve-ProjectPath $Root $c.srt); Required = $false }
}

foreach ($loopFile in $loopFiles) {
    $checks += @{ Name = "loop:$loopFile"; Path = (Join-Path $loopsDir $loopFile); Required = $true }
}

$ok = $true
Write-Host "Config: $configPath"
Write-Host "Root:   $Root"
Write-Host "Song:   $($c.songSlug)"
Write-Host "Loops:  $($loopFiles.Count) file(s)"
foreach ($check in $checks) {
    $exists = Test-Path $check.Path
    $status = if ($exists) { "OK" } else { "MISSING" }
    if (-not $exists -and $check.Required) { $ok = $false }
    Write-Host "  [$status] $($check.Name): $($check.Path)"
}

$horiz = Join-Path (Resolve-ProjectPath $Root $VideosDir) "$($c.songSlug)-horizontal-loop-v5.mp4"
$port = Join-Path (Resolve-ProjectPath $Root $VideosDir) "$($c.songSlug)-portrait-loop-v5.mp4"
if (Test-Path $horiz) { Write-Host "  [exists] prior horizontal: $horiz" }
if (Test-Path $port) { Write-Host "  [exists] prior portrait: $port" }

if (-not $ok) {
    Write-Host "Validation FAILED (required paths missing)."
    exit 1
}
Write-Host "Validation OK."
exit 0
