# Generates safe-zone guide PNGs from exported or source masters.
# Usage: ... -Config tools/social-video/<campaign>.campaign.json [-ProjectRoot .]

param(
    [Parameter(Mandatory = $true)]
    [string]$Config,
    [string]$ProjectRoot = ""
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$KitRoot = Split-Path -Parent $ScriptDir
. (Join-Path $ScriptDir "_common.ps1")

$initialRoot = if ($ProjectRoot) { (Resolve-Path $ProjectRoot).Path } else { (Get-Location).Path }
$configPath = Resolve-SocialConfigPath -Path $Config -Root $initialRoot
$campaign = Get-Content $configPath -Raw | ConvertFrom-Json
$Root = Get-SocialProjectRoot -ConfigPath $configPath -Campaign $campaign -ProjectRootArg $ProjectRoot
$registry = Get-PlatformsRegistry -KitRoot $KitRoot

Set-Location $Root

$horizontal = Resolve-ProjectPath $Root $campaign.sources.horizontal
$portrait = Resolve-ProjectPath $Root $campaign.sources.portrait
$outputsDir = Resolve-ProjectPath $Root $campaign.outputsDir
$previewsDir = Join-Path $outputsDir "previews"

New-Item -ItemType Directory -Force -Path $previewsDir | Out-Null

$thumbSeek = 46.0
if ($campaign.PSObject.Properties.Name -contains "thumbSeekSeconds") {
    $thumbSeek = [double]$campaign.thumbSeekSeconds
}

function New-SafeZoneOverlay {
    param(
        [string]$SourceVideo,
        [string]$OutputPng,
        $PlatformSpec,
        [string]$PlatformKey
    )
    if (-not (Test-Path $SourceVideo)) {
        Write-Host "  Skip $PlatformKey - source not found: $SourceVideo"
        return
    }

    $w = [int]$PlatformSpec.width
    $h = [int]$PlatformSpec.height
    $topPct = [double]$PlatformSpec.safeZone.topPercent
    $bottomPct = [double]$PlatformSpec.safeZone.bottomPercent
    $sidePct = [double]$PlatformSpec.safeZone.sidePercent

    $topH = [int][Math]::Round($h * ($topPct / 100.0))
    $bottomH = [int][Math]::Round($h * ($bottomPct / 100.0))
    $sideW = [int][Math]::Round($w * ($sidePct / 100.0))
    $safeH = $h - $topH - $bottomH
    $safeW = $w - (2 * $sideW)

    $framePath = Join-Path $previewsDir "_frame_${PlatformKey}.png"
    Invoke-Ffmpeg -FfmpegArgs @("-y", "-ss", "$thumbSeek", "-i", $SourceVideo, "-frames:v", "1", "-update", "1", "-q:v", "2", $framePath)

    $bottomY = $h - $bottomH
    $rightX = $w - $sideW
    $draw = @(
        "drawbox=x=0:y=0:w=${w}:h=${topH}:color=black@0.45:t=fill",
        "drawbox=x=0:y=${bottomY}:w=${w}:h=${bottomH}:color=black@0.45:t=fill",
        "drawbox=x=0:y=${topH}:w=${sideW}:h=${safeH}:color=black@0.45:t=fill",
        "drawbox=x=${rightX}:y=${topH}:w=${sideW}:h=${safeH}:color=black@0.45:t=fill",
        "drawbox=x=${sideW}:y=${topH}:w=${safeW}:h=${safeH}:color=green@0.15:t=fill",
        "drawtext=text=SAFE\\ ZONE:fontcolor=white:fontsize=28:x=$($sideW + 12):y=$($topH + 12)",
        "drawtext=text=${PlatformKey}\\ (${PlatformSpec.aspect}):fontcolor=white:fontsize=22:x=$($sideW + 12):y=$($topH + 48)"
    ) -join ","

    $vf = "scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2,${draw}"
    $filterScript = Join-Path $previewsDir "_filter_${PlatformKey}.txt"
    Set-Content -Path $filterScript -Value $vf -Encoding ASCII -NoNewline

    Write-Host "  Safe zone: $PlatformKey -> $OutputPng"
    Invoke-Ffmpeg -FfmpegArgs @("-y", "-i", $framePath, "-filter_script:v", $filterScript, "-frames:v", "1", "-update", "1", "-q:v", "2", $OutputPng)
    Remove-Item -Force $filterScript -ErrorAction SilentlyContinue
    Remove-Item -Force $framePath -ErrorAction SilentlyContinue
}

Write-Host "[$($campaign.campaignSlug)] Generating safe-zone previews..."

foreach ($prop in $campaign.exports.PSObject.Properties) {
    $platformKey = $prop.Name
    $exportCfg = $prop.Value
    if (-not $exportCfg.enabled) { continue }

    $platform = $registry.platforms.$platformKey
    $sourceVideo = if ($platform.sourceMaster -eq "horizontal") { $horizontal } else { $portrait }

    if ($platform.crop) {
        $sourceVideo = $portrait
    }

    $outPng = Join-Path $previewsDir "${platformKey}-safe-zone.png"
    New-SafeZoneOverlay -SourceVideo $sourceVideo -OutputPng $outPng -PlatformSpec $platform -PlatformKey $platformKey
}

Write-Host "Done. Previews in $previewsDir"
