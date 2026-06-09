# Burns a timed top-hook text overlay onto a video (white text, gold outline).
# Usage: ... -InputPath <in.mp4> -OutputPath <out.mp4> -Text "..." -StartSeconds 0 -EndSeconds 3.5
#        -Orientation portrait|horizontal [-Brand <hashtable>] [-PlatformSpec <object>]

param(
    [Parameter(Mandatory = $true)]
    [string]$InputPath,
    [Parameter(Mandatory = $true)]
    [string]$OutputPath,
    [Parameter(Mandatory = $true)]
    [string]$Text,
    [double]$StartSeconds = 0,
    [double]$EndSeconds = 3.5,
    [ValidateSet("portrait", "horizontal")]
    [string]$Orientation = "portrait",
    [hashtable]$Brand = @{},
    [object]$PlatformSpec = $null,
    [string]$Position = "top_safe"
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $ScriptDir "_common.ps1")

if (-not (Test-Path -LiteralPath $InputPath)) { throw "Input not found: $InputPath" }

$outDir = Split-Path -Parent $OutputPath
if ($outDir -and $outDir -ne "" -and -not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Force -Path $outDir | Out-Null
}

$probeOut = ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x $InputPath
$dims = $probeOut.Trim() -split "x"
$videoW = [int]$dims[0]
$videoH = [int]$dims[1]

$brandHt = Get-BrandHashtable -BrandObj $Brand
$fontSize = Get-BrandFontSize -Brand $brandHt -Orientation $Orientation
$fontName = if ($brandHt.ContainsKey("hookFont") -and $brandHt["hookFont"]) { $brandHt["hookFont"] } else { "Arial" }

$yPos = if ($PlatformSpec) {
    Get-SafeZoneY -PlatformSpec $PlatformSpec -VideoHeight $videoH -Position $Position
} elseif ($Orientation -eq "horizontal") {
    [int][Math]::Round($videoH * 0.10)
} else {
    [int][Math]::Round($videoH * 0.14)
}
if (-not $yPos -or $yPos -lt 1) {
    $yPos = [int][Math]::Round($videoH * 0.14)
}

$escapedText = Escape-FfmpegDrawtext -Text $Text
$enableExpr = "between(t,$StartSeconds,$EndSeconds)"

$fontFileArg = ""
if ($brandHt.ContainsKey("hookFontFile") -and $brandHt["hookFontFile"] -and (Test-Path -LiteralPath $brandHt["hookFontFile"])) {
    $fontPath = ($brandHt["hookFontFile"] -replace '\\', '/')
    $fontFileArg = ":fontfile='$fontPath'"
}

$drawtext = "drawtext=text='$escapedText'${fontFileArg}:font='$fontName':fontsize=${fontSize}:fontcolor=white:borderw=3:bordercolor=0xa87727:x=(w-text_w)/2:y=${yPos}:line_spacing=8:enable='$enableExpr'"

Write-Host "Applying hook overlay ($Orientation, ${StartSeconds}s-${EndSeconds}s) -> $OutputPath"
Invoke-Ffmpeg -FfmpegArgs @("-y", "-i", $InputPath, "-vf", $drawtext, "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart", $OutputPath)

if (-not (Test-Path $OutputPath)) { throw "Hook overlay failed: $OutputPath" }
Write-Host "Done: $OutputPath"
