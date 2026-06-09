# Crops portrait master to square (1:1) or 4:5 for feed posts.
# Usage: ... -InputPath <portrait.mp4> -OutputPath <out.mp4> -Aspect square|4x5 [-IncludeLyricBand]

param(
    [Parameter(Mandatory = $true)]
    [string]$InputPath,
    [Parameter(Mandatory = $true)]
    [string]$OutputPath,
    [Parameter(Mandatory = $true)]
    [ValidateSet("square", "4x5")]
    [string]$Aspect,
    [switch]$IncludeLyricBand
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $ScriptDir "_common.ps1")

if (-not (Test-Path -LiteralPath $InputPath)) { throw "Input not found: $InputPath" }

$outDir = Split-Path -Parent $OutputPath
if ($outDir -and $outDir -ne "" -and -not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Force -Path $outDir | Out-Null
}

if ($Aspect -eq "square") {
    if ($IncludeLyricBand) {
        $crop = "crop=1080:1080:(iw-1080)/2:0"
    } else {
        $crop = "crop=1080:1080:0:0"
    }
} else {
    if ($IncludeLyricBand) {
        $crop = "crop=1080:1350:(iw-1080)/2:0"
    } else {
        $crop = "crop=1080:1350:0:0"
    }
}

$vf = "${crop},scale=1080:$(if ($Aspect -eq 'square') { '1080' } else { '1350' }):flags=lanczos"

Write-Host "Cropping $Aspect from $InputPath -> $OutputPath"
Invoke-Ffmpeg -FfmpegArgs @("-y", "-i", $InputPath, "-vf", $vf, "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart", $OutputPath)

if (-not (Test-Path $OutputPath)) { throw "Crop failed: $OutputPath" }
Write-Host "Done: $OutputPath"
