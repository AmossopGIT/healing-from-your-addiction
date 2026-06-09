# Shared helpers for social-video-kit scripts.

function Resolve-SocialConfigPath {
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

function Get-SocialProjectRoot {
    param([string]$ConfigPath, $Campaign, [string]$ProjectRootArg)
    if ($ProjectRootArg) {
        return (Resolve-Path $ProjectRootArg).Path
    }
    if ($Campaign.PSObject.Properties.Name -contains "projectRoot" -and $Campaign.projectRoot -and $Campaign.projectRoot -ne ".") {
        $configDir = Split-Path $ConfigPath -Parent
        return (Resolve-Path (Join-Path $configDir $Campaign.projectRoot)).Path
    }
    $configDir = Split-Path $ConfigPath -Parent
    if ($configDir -match '[\\/]social-video$') {
        return (Resolve-Path (Join-Path $configDir "..\..")).Path
    }
    if ($configDir -match '[\\/]config$') {
        return (Resolve-Path (Join-Path $configDir "..")).Path
    }
    return (Get-Location).Path
}

function Get-PlatformsRegistry {
    param([string]$KitRoot)
    $platformsPath = Join-Path $KitRoot "config\platforms.json"
    if (-not (Test-Path $platformsPath)) {
        throw "Missing platforms registry: $platformsPath"
    }
    return Get-Content $platformsPath -Raw | ConvertFrom-Json
}

function Get-HookById {
    param($Campaign, [string]$HookId)
    if (-not $HookId) { return $null }
    foreach ($hook in $Campaign.hooks) {
        if ($hook.id -eq $HookId) { return $hook }
    }
    throw "Hook not found in config: $HookId"
}

function Get-SafeZoneY {
    param($PlatformSpec, [int]$VideoHeight, [string]$Position)
    $topPercent = [double]$PlatformSpec.safeZone.topPercent
    if ($Position -eq "top_safe") {
        return [int][Math]::Round($VideoHeight * ($topPercent / 100.0))
    }
    return [int][Math]::Round($VideoHeight * 0.12)
}

function Escape-FfmpegDrawtext {
    param([string]$Text)
    $escaped = $Text -replace "\\", "\\\\"
    $escaped = $escaped -replace "'", "'\\''"
    $escaped = $escaped -replace ":", "\:"
    $escaped = $escaped -replace "`r`n", "\n"
    $escaped = $escaped -replace "`n", "\n"
    return $escaped
}

function Get-BrandHashtable {
    param($BrandObj)
    $ht = @{}
    if (-not $BrandObj) { return $ht }
    if ($BrandObj -is [hashtable]) { return $BrandObj }
    foreach ($prop in $BrandObj.PSObject.Properties) {
        $ht[$prop.Name] = $prop.Value
    }
    return $ht
}

function Get-BrandFontSize {
    param($Brand, [string]$Orientation)
    $brandHt = Get-BrandHashtable -BrandObj $Brand
    if ($Orientation -eq "horizontal") {
        if ($brandHt.ContainsKey("hookFontSizeHorizontal")) {
            return [int]$brandHt["hookFontSizeHorizontal"]
        }
        return 36
    }
    if ($brandHt.ContainsKey("hookFontSizePortrait")) {
        return [int]$brandHt["hookFontSizePortrait"]
    }
    return 44
}

function Invoke-Ffmpeg {
    param([string[]]$FfmpegArgs)
    $prev = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    & ffmpeg @FfmpegArgs 2>&1 | Out-Null
    $code = $LASTEXITCODE
    $ErrorActionPreference = $prev
    if ($code -ne 0) {
        throw "ffmpeg failed (exit $code): ffmpeg $($FfmpegArgs -join ' ')"
    }
}

function Get-OutputFileName {
    param([string]$SongSlug, [string]$Suffix, [string]$Variant)
    if ($Variant -and $Variant -ne "") {
        return "${SongSlug}-${Suffix}-${Variant}.mp4"
    }
    return "${SongSlug}-${Suffix}.mp4"
}
