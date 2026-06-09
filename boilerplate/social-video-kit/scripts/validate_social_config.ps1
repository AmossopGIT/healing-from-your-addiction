# Validates a social video campaign config: JSON, sources, hooks, exports.
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

$errors = @()
$warnings = @()

if (-not $campaign.campaignSlug) { $errors += "Missing campaignSlug" }
if (-not $campaign.songSlug) { $errors += "Missing songSlug" }
if (-not $campaign.sources) { $errors += "Missing sources" }

$horizontal = Resolve-ProjectPath $Root $campaign.sources.horizontal
$portrait = Resolve-ProjectPath $Root $campaign.sources.portrait

if (-not (Test-Path $horizontal)) { $errors += "Horizontal source not found: $horizontal" }
if (-not (Test-Path $portrait)) { $errors += "Portrait source not found: $portrait" }

$outputsDir = Resolve-ProjectPath $Root $campaign.outputsDir
if (-not $outputsDir) { $errors += "Missing outputsDir" }

$hookIds = @{}
if ($campaign.hooks) {
    foreach ($hook in $campaign.hooks) {
        if (-not $hook.id) { $errors += "Hook missing id" }
        elseif ($hookIds.ContainsKey($hook.id)) { $errors += "Duplicate hook id: $($hook.id)" }
        else { $hookIds[$hook.id] = $true }
    }
}

if ($campaign.exports) {
    foreach ($prop in $campaign.exports.PSObject.Properties) {
        $platformKey = $prop.Name
        $exportCfg = $prop.Value
        if (-not $exportCfg.enabled) { continue }

        if (-not $registry.platforms.PSObject.Properties.Name -contains $platformKey) {
            $errors += "Unknown platform key in exports: $platformKey"
            continue
        }

        $platform = $registry.platforms.$platformKey
        if ($exportCfg.PSObject.Properties.Name -contains "hookId" -and $exportCfg.hookId) {
            if (-not $hookIds.ContainsKey($exportCfg.hookId)) {
                $errors += "Export '$platformKey' references unknown hookId: $($exportCfg.hookId)"
            }
        }

        if ($platform.crop) {
            if (-not (Test-Path $portrait)) {
                $errors += "Portrait source required for crop platform '$platformKey'"
            }
        } elseif ($platform.sourceMaster -eq "horizontal" -and -not (Test-Path $horizontal)) {
            $errors += "Horizontal source required for '$platformKey'"
        } elseif ($platform.sourceMaster -eq "portrait" -and -not (Test-Path $portrait)) {
            $errors += "Portrait source required for '$platformKey'"
        }
    }
} else {
    $errors += "Missing exports block"
}

Write-Host "Social video config validation"
Write-Host "  Config:     $configPath"
Write-Host "  Project:    $Root"
Write-Host "  Campaign:   $($campaign.campaignSlug)"
Write-Host "  Song:       $($campaign.songSlug)"
Write-Host "  Outputs:    $outputsDir"
Write-Host "  Horizontal: $horizontal"
Write-Host "  Portrait:   $portrait"

if ($warnings.Count -gt 0) {
    Write-Host ""
    Write-Host "Warnings:"
    foreach ($w in $warnings) { Write-Host "  - $w" }
}

if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "Errors:"
    foreach ($e in $errors) { Write-Host "  - $e" }
    exit 1
}

Write-Host ""
Write-Host "OK - config is valid."
exit 0
