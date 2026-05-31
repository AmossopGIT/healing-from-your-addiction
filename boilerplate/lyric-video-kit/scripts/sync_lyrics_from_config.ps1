# Whisper draft → align → phrase-split from a lyric-video JSON config.
# Usage:
#   ... -Config tools/lyric-video/<song-slug>.config.json [-ProjectRoot .]

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

$songSlug = $c.songSlug
$Audio = Resolve-ProjectPath -Root $Root -Path $c.audioPath
$SrtOut = Resolve-ProjectPath -Root $Root -Path $c.srt
$VideosDir = Split-Path $SrtOut -Parent
New-Item -ItemType Directory -Force -Path $VideosDir | Out-Null

$SrtDraft = Join-Path $VideosDir "${songSlug}-exact-v1-draft.srt"
$SrtAligned = Join-Path $VideosDir "${songSlug}-exact-v1-aligned.srt"
$Transcript = Join-Path $VideosDir "${songSlug}-transcript.json"

if (-not $c.PSObject.Properties.Name -contains "lyricsPath" -or -not $c.lyricsPath) {
    throw "Config missing lyricsPath (plain text / suno-paste.txt for draft SRT)."
}
$Lyrics = Resolve-ProjectPath -Root $Root -Path $c.lyricsPath
if (-not (Test-Path $Lyrics)) { throw "Lyrics file not found: $Lyrics" }
if (-not (Test-Path $Audio)) { throw "Audio not found: $Audio" }

$syncStart = 12.0
if ($c.PSObject.Properties.Name -contains "lyricSyncStart" -and $null -ne $c.lyricSyncStart) {
    $syncStart = [double]$c.lyricSyncStart
}
$whisperModel = "medium"
if ($c.PSObject.Properties.Name -contains "whisperModel" -and $c.whisperModel) {
    $whisperModel = $c.whisperModel
}

$durationRaw = ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $Audio
$syncEnd = [math]::Max(60, [double]$durationRaw.Trim() - 6)
if ($c.PSObject.Properties.Name -contains "lyricSyncEnd" -and $null -ne $c.lyricSyncEnd) {
    $syncEnd = [double]$c.lyricSyncEnd
}

$DraftScript = Join-Path $ScriptDir "lyrics_to_draft_srt.py"
$TranscribeScript = Join-Path $ScriptDir "transcribe_song_whisper.py"
$AlignScript = Join-Path $ScriptDir "align_lyrics_whisper.py"
$PhraseScript = Join-Path $ScriptDir "phrase_split_srt.py"

Write-Host "[$songSlug] Draft SRT from lyrics..."
python $DraftScript --lyrics $Lyrics --output $SrtDraft --start $syncStart --end $syncEnd

Write-Host "[$songSlug] Whisper transcript ($whisperModel, word timestamps)..."
python $TranscribeScript --audio $Audio --output $Transcript --model $whisperModel

Write-Host "[$songSlug] Align lyrics to sung audio..."
python $AlignScript --input-srt $SrtDraft --transcript-json $Transcript --output-srt $SrtAligned

Write-Host "[$songSlug] Phrase-split for beat-friendly cues..."
python $PhraseScript --input-srt $SrtAligned --transcript-json $Transcript --output-srt $SrtOut

Write-Host "Done: $SrtOut"
Write-Host "Optional: fine-tune in Aegisub using $SrtAligned, then re-export as exact-v1.srt."
