param([string]$RuntimeZip='', [string]$Destination='')
$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
if (!$Destination) { $Destination=Join-Path $projectRoot 'release/AlchemyRuins-Windows' }
$Destination=[IO.Path]::GetFullPath($Destination)
if (Test-Path -LiteralPath $Destination) { throw "Output already exists: $Destination. Choose a new -Destination." }
$version='44.9.1'
$expected='41bd7900bd42d0f49110a81617876137041fbbf473466920248ddb076349ef91'
if (!$RuntimeZip) {
  $cacheDir=Join-Path $projectRoot '.build-cache'
  New-Item -ItemType Directory -Path $cacheDir -Force | Out-Null
  $RuntimeZip=Join-Path $cacheDir "electron-v$version-win32-x64.zip"
  if (!(Test-Path -LiteralPath $RuntimeZip)) {
    Invoke-WebRequest -Uri "https://github.com/electron/electron/releases/download/v$version/electron-v$version-win32-x64.zip" -OutFile $RuntimeZip
  }
}
if ((Get-FileHash -LiteralPath $RuntimeZip -Algorithm SHA256).Hash.ToLowerInvariant() -ne $expected) { throw 'Electron SHA256 mismatch.' }
Expand-Archive -LiteralPath $RuntimeZip -DestinationPath $Destination
Rename-Item -LiteralPath (Join-Path $Destination 'electron.exe') -NewName 'AlchemyRuins.exe'
$appDir=Join-Path $Destination 'resources/app'
New-Item -ItemType Directory -Path $appDir -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $projectRoot 'web') -Destination $appDir -Recurse
Copy-Item -LiteralPath (Join-Path $projectRoot 'electron.cjs'),(Join-Path $projectRoot 'package.json') -Destination $appDir
Copy-Item -LiteralPath (Join-Path $projectRoot 'README.md') -Destination (Join-Path $Destination 'README.txt')
Write-Output "Windows game: $(Join-Path $Destination 'AlchemyRuins.exe')"
