# Renders loop-v5 lyric video masters from a JSON config (horizontal + portrait).
# Optional Whisper sync: lyricsPath + lyricSyncStart in config (use -SkipSync to reuse SRT).
# Usage:
#   powershell -ExecutionPolicy Bypass -File boilerplate/lyric-video-kit/scripts/render_lyric_video_loop.ps1 `
#     -Config tools/lyric-video/<song-slug>.config.json [-ProjectRoot .] [-SkipSync]

param(
    [Parameter(Mandatory = $true)]
    [string]$Config,
    [string]$ProjectRoot = "",
    [switch]$SkipSync
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$KitRoot = Split-Path -Parent $ScriptDir
$BuildAlternatingScript = Join-Path $ScriptDir "build_alternating_loop_bg.py"
$BuildMultiLoopScript = Join-Path $ScriptDir "build_multi_loop_bg.py"
$SyncScript = Join-Path $ScriptDir "sync_lyrics_from_config.ps1"

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
    $fromKit = Join-Path $KitRoot $Path
    if (Test-Path $fromKit) { return (Resolve-Path $fromKit).Path }
    throw "Config not found: $Path"
}

function Resolve-ProjectPath {
    param([string]$Root, [string]$Path)
    if ([string]::IsNullOrWhiteSpace($Path)) { return $null }
    if ([System.IO.Path]::IsPathRooted($Path)) { return $Path }
    return (Join-Path $Root $Path)
}

function Get-FfmpegSubPath {
    param([string]$Path)
    return ($Path -replace '\\', '/')
}

function Get-ConfigLoops {
    param($Config)
    $entries = @()
    if ($Config.PSObject.Properties.Name -contains "loops" -and $Config.loops) {
        foreach ($item in $Config.loops) {
            $download = ""
            if ($item.PSObject.Properties.Name -contains "download" -and $item.download) {
                $download = $item.download
            }
            $entries += @{ File = $item.file; Download = $download }
        }
    } else {
        $legacy = @(
            @{ Key = "loopA"; Down = "loopADownload" },
            @{ Key = "loopB"; Down = "loopBDownload" },
            @{ Key = "loopC"; Down = "loopCDownload" }
        )
        foreach ($legacyItem in $legacy) {
            if ($Config.PSObject.Properties.Name -contains $legacyItem.Key -and $Config.($legacyItem.Key)) {
                $download = ""
                if ($Config.PSObject.Properties.Name -contains $legacyItem.Down -and $Config.($legacyItem.Down)) {
                    $download = $Config.($legacyItem.Down)
                }
                $entries += @{ File = $Config.($legacyItem.Key); Download = $download }
            }
        }
    }
    if ($entries.Count -lt 1) {
        throw "Config must define loops[] or at least loopA (+ loopB)."
    }
    return $entries
}

function Get-ConfigDuration {
    param($Config, [string]$AudioPath)
    if ($Config.PSObject.Properties.Name -contains "duration" -and $null -ne $Config.duration -and [double]$Config.duration -gt 0) {
        return [double]$Config.duration
    }
    $durationRaw = ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $AudioPath
    return [double]$durationRaw.Trim()
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

Set-Location $Root

$VideosDir = if ($c.PSObject.Properties.Name -contains "videosDir" -and $c.videosDir) {
    $c.videosDir
} else {
    "public/videos"
}
$VideosDirAbs = Resolve-ProjectPath -Root $Root -Path $VideosDir
New-Item -ItemType Directory -Force -Path $VideosDirAbs | Out-Null

$songSlug = $c.songSlug
$blogSlug = $c.blogSlug
$LoopsDir = Resolve-ProjectPath -Root $Root -Path $c.loopsDir
$BottomCrop = [int]$c.bottomCrop
$Srt = Resolve-ProjectPath -Root $Root -Path $c.srt
$Audio = Resolve-ProjectPath -Root $Root -Path $c.audioPath
$SrtFfmpeg = Get-FfmpegSubPath $Srt

$skipLyricSync = $false
if ($c.PSObject.Properties.Name -contains "skipLyricSync" -and $c.skipLyricSync) {
    $skipLyricSync = $true
}

if (-not $SkipSync -and -not $skipLyricSync) {
    if ($c.PSObject.Properties.Name -contains "lyricsPath" -and $c.lyricsPath) {
        Write-Host "[$songSlug] Syncing lyrics (Whisper + align + phrase split)..."
        & $SyncScript -Config $configPath -ProjectRoot $Root
    } else {
        Write-Host "[$songSlug] No lyricsPath in config — using existing SRT (pass -SkipSync to silence this note)."
    }
} elseif (-not (Test-Path $Srt)) {
    throw "Missing SRT: $Srt — add lyricsPath and run without -SkipSync, or place exact-v1.srt first."
}

if (-not (Test-Path $Audio)) { throw "Audio not found: $Audio" }

$Duration = Get-ConfigDuration -Config $c -AudioPath $Audio
Write-Host "[$songSlug] Duration: $Duration s"

New-Item -ItemType Directory -Force -Path $LoopsDir | Out-Null
$loopEntries = Get-ConfigLoops -Config $c
$PreppedLoops = @()
$cropFilter = "crop=iw:ih-${BottomCrop}:0:0,fps=30"

foreach ($loop in $loopEntries) {
    $loopSource = Join-Path $LoopsDir $loop.File
    if ($loop.Download -and -not (Test-Path $loopSource)) {
        Copy-Item -Force $loop.Download $loopSource
    }
    if (-not (Test-Path $loopSource)) {
        throw "Loop not found: $loopSource (set download path in config or copy file manually)."
    }
    $loopBase = [System.IO.Path]::GetFileNameWithoutExtension($loop.File)
    $prepped = Join-Path $LoopsDir "$loopBase-prepped.mp4"
    Write-Host "[$songSlug] Prepping $prepped..."
    ffmpeg -y -i $loopSource -vf $cropFilter -an -c:v libx264 -preset veryfast -pix_fmt yuv420p $prepped
    $PreppedLoops += $prepped
}

$loopCount = $PreppedLoops.Count
if ($c.PSObject.Properties.Name -contains "backgroundOutput" -and $c.backgroundOutput) {
    $bgFileName = $c.backgroundOutput
} elseif ($loopCount -eq 2) {
    $bgFileName = "${songSlug}-bg-alternating.mp4"
} else {
    $bgFileName = "${songSlug}-bg-loop.mp4"
}
$Bg = Join-Path $VideosDirAbs $bgFileName
$HorizontalOut = Join-Path $VideosDirAbs "${songSlug}-horizontal-loop-v5.mp4"
$PortraitOut = Join-Path $VideosDirAbs "${songSlug}-portrait-loop-v5.mp4"
$YoutubeThumb = Join-Path $VideosDirAbs "${songSlug}-youtube-thumb.png"
$previewPrefix = $blogSlug

Write-Host "[$songSlug] Project root: $Root"
Write-Host "[$songSlug] Videos dir: $VideosDirAbs"
Write-Host "[$songSlug] Building background ($loopCount loops)..."

if ($loopCount -eq 2) {
    python $BuildAlternatingScript `
        --loop-a $PreppedLoops[0] `
        --loop-b $PreppedLoops[1] `
        --duration $Duration `
        --output $Bg
} else {
    $pyArgs = @($BuildMultiLoopScript, "--duration", "$Duration", "--output", $Bg)
    foreach ($prepped in $PreppedLoops) {
        $pyArgs += "--loop", $prepped
    }
    python @pyArgs
}

Write-Host "[$songSlug] Rendering horizontal..."
$horizontalVf = @"
scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,subtitles='$SrtFfmpeg':original_size=1920x1080:force_style='FontName=Arial,FontSize=16,Alignment=2,MarginL=120,MarginR=120,MarginV=24,PrimaryColour=&H00FFFFFF,OutlineColour=&H002777A8,BackColour=&H00000000,BorderStyle=1,Outline=1,Shadow=0,WrapStyle=0'
"@
ffmpeg -y -i $Bg -i $Audio -vf $horizontalVf -c:v libx264 -preset veryfast -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest $HorizontalOut

Write-Host "[$songSlug] Rendering portrait..."
$portraitFc = @"
[0:v]scale=1080:960:force_original_aspect_ratio=decrease,pad=1080:960:(ow-iw)/2:(oh-ih)/2:color=#f7f3ea[top];
color=#f7f3ea:s=1080x1920[bg];
[bg][top]overlay=0:0[base];
[base]subtitles='$SrtFfmpeg':original_size=1080x1920:force_style='FontName=Arial,FontSize=17,Alignment=2,MarginL=56,MarginR=56,MarginV=48,PrimaryColour=&H00FFFFFF,OutlineColour=&H002777A8,BackColour=&H80000000,BorderStyle=1,Outline=1,Shadow=0,WrapStyle=0'[v]
"@
ffmpeg -y -i $Bg -i $Audio -filter_complex $portraitFc -map "[v]" -map 1:a -c:v libx264 -preset veryfast -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest $PortraitOut

$thumbSs = [double]$c.thumbSeekSeconds
$previewSs = [double]$c.previewSeekSeconds
Write-Host "[$songSlug] Thumbnail and previews..."
ffmpeg -y -ss $thumbSs -i $HorizontalOut -frames:v 1 -update 1 -q:v 2 $YoutubeThumb
ffmpeg -y -ss $previewSs -i $HorizontalOut -frames:v 1 -update 1 (Join-Path $VideosDirAbs "${previewPrefix}-horizontal-loop-v5-preview.png")
ffmpeg -y -ss $previewSs -i $PortraitOut -frames:v 1 -update 1 (Join-Path $VideosDirAbs "${previewPrefix}-portrait-loop-v5-preview.png")

Write-Host "Done."
Write-Host "  $HorizontalOut"
Write-Host "  $PortraitOut"
Write-Host "  $Bg"
Write-Host "  $YoutubeThumb"
