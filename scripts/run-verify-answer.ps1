$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$shimDir = Join-Path $repoRoot ".codex\\pnpm-shim"

if (Test-Path $shimDir) {
  $env:PATH = "$shimDir;$env:PATH"
}

$corepackCommand = Get-Command corepack.cmd -ErrorAction SilentlyContinue
if (-not $corepackCommand) {
  $corepackCommand = Get-Command corepack -ErrorAction SilentlyContinue
}

if (-not $corepackCommand) {
  throw "corepack is unavailable. Install corepack or restore .codex/pnpm-shim."
}

Push-Location $repoRoot
try {
  & $corepackCommand.Source pnpm verify:answer
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
}
finally {
  Pop-Location
}
