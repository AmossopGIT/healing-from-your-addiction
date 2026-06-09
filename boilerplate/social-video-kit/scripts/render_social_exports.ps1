# Renders platform social exports from loop-v5 masters (copy, crop, hook burn-in).
# Usage:
#   powershell -ExecutionPolicy Bypass -File boilerplate/social-video-kit/scripts/render_social_exports.ps1 `
#     -Config tools/social-video/<campaign>.campaign.json [-ProjectRoot .]

param(
    [Parameter(Mandatory = $true)]
    [string]$Config,
    [string]$ProjectRoot = ""
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$KitRoot = Split-Path -Parent $ScriptDir
. (Join-Path $ScriptDir "_common.ps1")

$CropScript = Join-Path $ScriptDir "crop_aspect.ps1"
$HookScript = Join-Path $ScriptDir "apply_hook_overlay.ps1"
$ValidateScript = Join-Path $ScriptDir "validate_social_config.ps1"

& $ValidateScript -Config $Config -ProjectRoot $ProjectRoot
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$initialRoot = if ($ProjectRoot) { (Resolve-Path $ProjectRoot).Path } else { (Get-Location).Path }
$configPath = Resolve-SocialConfigPath -Path $Config -Root $initialRoot
$campaign = Get-Content $configPath -Raw | ConvertFrom-Json
$Root = Get-SocialProjectRoot -ConfigPath $configPath -Campaign $campaign -ProjectRootArg $ProjectRoot
$registry = Get-PlatformsRegistry -KitRoot $KitRoot

Set-Location $Root

$songSlug = $campaign.songSlug
$horizontal = Resolve-ProjectPath $Root $campaign.sources.horizontal
$portrait = Resolve-ProjectPath $Root $campaign.sources.portrait
$outputsDir = Resolve-ProjectPath $Root $campaign.outputsDir
$previewsDir = Join-Path $outputsDir "previews"

New-Item -ItemType Directory -Force -Path $outputsDir | Out-Null
New-Item -ItemType Directory -Force -Path $previewsDir | Out-Null

$brand = $campaign.brand
$thumbSeek = 46.0
if ($campaign.PSObject.Properties.Name -contains "thumbSeekSeconds") {
    $thumbSeek = [double]$campaign.thumbSeekSeconds
}

$manifestEntries = @()

function Add-ManifestEntry {
    param(
        [string]$PlatformKey,
        [string]$FilePath,
        [string]$Variant,
        [string]$HookId,
        [bool]$BurnIn,
        [string]$Aspect,
        [int]$Width,
        [int]$Height
    )
    $relPath = $FilePath
    if ($FilePath.StartsWith($Root)) {
        $relPath = $FilePath.Substring($Root.Length).TrimStart('\', '/')
    }
    $script:manifestEntries += [ordered]@{
        platform     = $PlatformKey
        file         = $relPath -replace '\\', '/'
        variant      = if ($Variant) { $Variant } else { "default" }
        hookId       = $HookId
        burnIn       = $BurnIn
        aspect       = $Aspect
        width        = $Width
        height       = $Height
    }
}

$brandHt = Get-BrandHashtable -BrandObj $brand

Write-Host "[$($campaign.campaignSlug)] Rendering social exports..."
Write-Host "  Project:  $Root"
Write-Host "  Outputs:  $outputsDir"

foreach ($prop in $campaign.exports.PSObject.Properties) {
    $platformKey = $prop.Name
    $exportCfg = $prop.Value
    if (-not $exportCfg.enabled) { continue }

    $platform = $registry.platforms.$platformKey
    $suffix = $platform.suffix
    $width = [int]$platform.width
    $height = [int]$platform.height
    $aspect = $platform.aspect

    $hook = $null
  if ($exportCfg.PSObject.Properties.Name -contains "hookId" -and $exportCfg.hookId) {
        $hook = Get-HookById -Campaign $campaign -HookId $exportCfg.hookId
    }

    $variants = @("default")
    if ($exportCfg.PSObject.Properties.Name -contains "variants" -and $exportCfg.variants) {
        $variants = @($exportCfg.variants)
    }

    foreach ($variant in $variants) {
        $fileName = Get-OutputFileName -SongSlug $songSlug -Suffix $suffix -Variant $(if ($variant -eq "default") { "" } else { $variant })
        $outPath = Join-Path $outputsDir $fileName

        if ($platform.crop) {
            $cropAspect = if ($aspect -eq "1:1") { "square" } else { "4x5" }
            $includeLyric = $false
            if ($exportCfg.PSObject.Properties.Name -contains "includeLyricBand" -and $exportCfg.includeLyricBand) {
                $includeLyric = $true
            }
            if ($variant -eq "hook" -and $hook -and $hook.burnIn) {
                $tempCrop = Join-Path $outputsDir "_temp_${songSlug}-${suffix}-crop.mp4"
                if ($includeLyric) {
                    & $CropScript -InputPath $portrait -OutputPath $tempCrop -Aspect $cropAspect -IncludeLyricBand
                } else {
                    & $CropScript -InputPath $portrait -OutputPath $tempCrop -Aspect $cropAspect
                }
                $orientation = "portrait"
                & $HookScript -InputPath $tempCrop -OutputPath $outPath -Text $hook.text `
                    -StartSeconds ([double]$hook.startSeconds) -EndSeconds ([double]$hook.endSeconds) `
                    -Orientation $orientation -Brand $brandHt -PlatformSpec $platform -Position $hook.position
                Remove-Item -Force $tempCrop -ErrorAction SilentlyContinue
                Add-ManifestEntry -PlatformKey $platformKey -FilePath $outPath -Variant $variant `
                    -HookId $hook.id -BurnIn $true -Aspect $aspect -Width $width -Height $height
            } else {
                if ($includeLyric) {
                    & $CropScript -InputPath $portrait -OutputPath $outPath -Aspect $cropAspect -IncludeLyricBand
                } else {
                    & $CropScript -InputPath $portrait -OutputPath $outPath -Aspect $cropAspect
                }
                Add-ManifestEntry -PlatformKey $platformKey -FilePath $outPath -Variant $(if ($variant -eq "default") { "clean" } else { $variant }) `
                    -HookId $(if ($hook) { $hook.id } else { $null }) -BurnIn $false -Aspect $aspect -Width $width -Height $height
            }
            continue
        }

        $sourcePath = if ($platform.sourceMaster -eq "horizontal") { $horizontal } else { $portrait }
        $orientation = if ($platform.sourceMaster -eq "horizontal") { "horizontal" } else { "portrait" }

        if ($variant -eq "hook" -and $hook -and $hook.burnIn) {
            & $HookScript -InputPath $sourcePath -OutputPath $outPath -Text $hook.text `
                -StartSeconds ([double]$hook.startSeconds) -EndSeconds ([double]$hook.endSeconds) `
                -Orientation $orientation -Brand $brandHt -PlatformSpec $platform -Position $hook.position
            Add-ManifestEntry -PlatformKey $platformKey -FilePath $outPath -Variant "hook" `
                -HookId $hook.id -BurnIn $true -Aspect $aspect -Width $width -Height $height
        } elseif ($variant -eq "clean" -or ($exportCfg.copyMaster -and $variant -ne "hook")) {
            Write-Host "  Copy $platformKey ($variant) -> $fileName"
            Copy-Item -Force $sourcePath $outPath
            Add-ManifestEntry -PlatformKey $platformKey -FilePath $outPath -Variant "clean" `
                -HookId $(if ($hook) { $hook.id } else { $null }) -BurnIn $false -Aspect $aspect -Width $width -Height $height
        } elseif ($variant -eq "default") {
            $useCopy = $false
            if ($exportCfg.PSObject.Properties.Name -contains "copyMaster" -and $exportCfg.copyMaster) {
                $useCopy = $true
            }
            if ($useCopy -and -not ($hook -and $hook.burnIn)) {
                Write-Host "  Copy $platformKey -> $fileName"
                Copy-Item -Force $sourcePath $outPath
                Add-ManifestEntry -PlatformKey $platformKey -FilePath $outPath -Variant "clean" `
                    -HookId $null -BurnIn $false -Aspect $aspect -Width $width -Height $height
            } elseif ($hook -and $hook.burnIn) {
                & $HookScript -InputPath $sourcePath -OutputPath $outPath -Text $hook.text `
                    -StartSeconds ([double]$hook.startSeconds) -EndSeconds ([double]$hook.endSeconds) `
                    -Orientation $orientation -Brand $brandHt -PlatformSpec $platform -Position $hook.position
                Add-ManifestEntry -PlatformKey $platformKey -FilePath $outPath -Variant "hook" `
                    -HookId $hook.id -BurnIn $true -Aspect $aspect -Width $width -Height $height
            } else {
                Copy-Item -Force $sourcePath $outPath
                Add-ManifestEntry -PlatformKey $platformKey -FilePath $outPath -Variant "clean" `
                    -HookId $null -BurnIn $false -Aspect $aspect -Width $width -Height $height
            }
        }

        $previewName = "${platformKey}-$(if ($variant -eq 'default') { 'clean' } else { $variant })-preview.png"
        if (Test-Path $outPath) {
            Invoke-Ffmpeg -FfmpegArgs @("-y", "-ss", "$thumbSeek", "-i", $outPath, "-frames:v", "1", "-update", "1", "-q:v", "2", (Join-Path $previewsDir $previewName))
        }
    }
}

$manifest = [ordered]@{
    campaignSlug = $campaign.campaignSlug
    songSlug     = $songSlug
    generatedAt  = (Get-Date).ToUniversalTime().ToString("o")
    outputsDir   = ($outputsDir.Substring($Root.Length).TrimStart('\', '/') -replace '\\', '/')
    exports      = $manifestEntries
}

$manifestPath = Join-Path $outputsDir "manifest.json"
$manifest | ConvertTo-Json -Depth 6 | Set-Content -Path $manifestPath -Encoding UTF8

Write-Host ""
Write-Host "Done."
Write-Host "  Manifest: $manifestPath"
Write-Host "  Exports:  $($manifestEntries.Count) files"
