# Renders loop-v5 lyric video masters from a JSON config.
# Usage: powershell -ExecutionPolicy Bypass -File tools/render_lyric_video_loop.ps1 -Config tools/lyric-video/<song-slug>.config.json

param(
    [Parameter(Mandatory = $true)]
    [string]$Config
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

$configPath = Join-Path $Root $Config
if (-not (Test-Path $configPath)) {
    throw "Config not found: $configPath"
}

$c = Get-Content $configPath -Raw | ConvertFrom-Json
$songSlug = $c.songSlug
$blogSlug = $c.blogSlug
$VideosDir = "public/videos"
$LoopsDir = $c.loopsDir
$Duration = [double]$c.duration
$BottomCrop = [int]$c.bottomCrop
$Srt = $c.srt
$Audio = $c.audioPath

New-Item -ItemType Directory -Force -Path $LoopsDir | Out-Null

$loopASource = Join-Path $LoopsDir $c.loopA
$loopBSource = Join-Path $LoopsDir $c.loopB
if ($c.loopADownload -and -not (Test-Path $loopASource)) {
    Copy-Item -Force $c.loopADownload $loopASource
}
if ($c.loopBDownload -and -not (Test-Path $loopBSource)) {
    Copy-Item -Force $c.loopBDownload $loopBSource
}

$loopABase = [System.IO.Path]::GetFileNameWithoutExtension($c.loopA)
$loopBBase = [System.IO.Path]::GetFileNameWithoutExtension($c.loopB)
$LoopAPrepped = Join-Path $LoopsDir "$loopABase-prepped.mp4"
$LoopBPrepped = Join-Path $LoopsDir "$loopBBase-prepped.mp4"
$Bg = "$VideosDir/${songSlug}-bg-alternating.mp4"
$HorizontalOut = "$VideosDir/${songSlug}-horizontal-loop-v5.mp4"
$PortraitOut = "$VideosDir/${songSlug}-portrait-loop-v5.mp4"
$YoutubeThumb = "$VideosDir/${songSlug}-youtube-thumb.png"
$previewPrefix = $blogSlug

$cropFilter = "crop=iw:ih-${BottomCrop}:0:0,fps=30"

Write-Host "[$songSlug] Prepping loops..."
ffmpeg -y -i $loopASource -vf $cropFilter -an -c:v libx264 -preset veryfast -pix_fmt yuv420p $LoopAPrepped
ffmpeg -y -i $loopBSource -vf $cropFilter -an -c:v libx264 -preset veryfast -pix_fmt yuv420p $LoopBPrepped

Write-Host "[$songSlug] Building alternating background..."
python tools/build_alternating_loop_bg.py `
    --loop-a $LoopAPrepped `
    --loop-b $LoopBPrepped `
    --duration $Duration `
    --output $Bg

Write-Host "[$songSlug] Rendering horizontal..."
$horizontalVf = @"
scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,subtitles='$Srt':original_size=1920x1080:force_style='FontName=Arial,FontSize=16,Alignment=2,MarginL=120,MarginR=120,MarginV=24,PrimaryColour=&H00FFFFFF,OutlineColour=&H002777A8,BackColour=&H00000000,BorderStyle=1,Outline=1,Shadow=0,WrapStyle=0'
"@
ffmpeg -y -i $Bg -i $Audio -vf $horizontalVf -c:v libx264 -preset veryfast -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -movflags +faststart -shortest $HorizontalOut

Write-Host "[$songSlug] Rendering portrait..."
$portraitFc = @"
[0:v]scale=1080:960:force_original_aspect_ratio=decrease,pad=1080:960:(ow-iw)/2:(oh-ih)/2:color=#f7f3ea[top];
color=#f7f3ea:s=1080x1920[bg];
[bg][top]overlay=0:0[base];
[base]subtitles='$Srt':original_size=1080x1920:force_style='FontName=Arial,FontSize=17,Alignment=2,MarginL=56,MarginR=56,MarginV=48,PrimaryColour=&H00FFFFFF,OutlineColour=&H002777A8,BackColour=&H80000000,BorderStyle=1,Outline=1,Shadow=0,WrapStyle=0'[v]
"@
ffmpeg -y -i $Bg -i $Audio -filter_complex $portraitFc -map "[v]" -map 1:a -c:v libx264 -preset veryfast -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest $PortraitOut

$thumbSs = [double]$c.thumbSeekSeconds
$previewSs = [double]$c.previewSeekSeconds
Write-Host "[$songSlug] Thumbnail and previews..."
ffmpeg -y -ss $thumbSs -i $HorizontalOut -frames:v 1 -update 1 -q:v 2 $YoutubeThumb
ffmpeg -y -ss $previewSs -i $HorizontalOut -frames:v 1 -update 1 "$VideosDir/${previewPrefix}-horizontal-loop-v5-preview.png"
ffmpeg -y -ss $previewSs -i $PortraitOut -frames:v 1 -update 1 "$VideosDir/${previewPrefix}-portrait-loop-v5-preview.png"

Write-Host "Done."
Write-Host "  $HorizontalOut"
Write-Host "  $PortraitOut"
Write-Host "  $YoutubeThumb"
