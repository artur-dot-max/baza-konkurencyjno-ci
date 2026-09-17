param(
  [string]$Destination = "backups",
  [int]$RetentionDays = 30
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$backupRoot = [System.IO.Path]::GetFullPath((Join-Path $projectRoot $Destination))
$allowedRoot = [System.IO.Path]::GetFullPath((Join-Path $projectRoot "backups"))
if (-not $backupRoot.StartsWith($allowedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Katalog kopii musi znajdować się wewnątrz $allowedRoot"
}
New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$target = Join-Path $backupRoot "baza-konkurencyjnosci-$stamp.dump"
$start = [System.Diagnostics.ProcessStartInfo]::new("docker")
$start.ArgumentList.Add("compose")
$start.ArgumentList.Add("exec")
$start.ArgumentList.Add("-T")
$start.ArgumentList.Add("db")
$start.ArgumentList.Add("sh")
$start.ArgumentList.Add("-c")
$start.ArgumentList.Add('pg_dump -Fc -U "$POSTGRES_USER" -d "$POSTGRES_DB"')
$start.UseShellExecute = $false
$start.RedirectStandardOutput = $true
$start.RedirectStandardError = $true
$process = [System.Diagnostics.Process]::Start($start)
$file = [System.IO.File]::Create($target)
$process.StandardOutput.BaseStream.CopyTo($file)
$file.Dispose()
$errorText = $process.StandardError.ReadToEnd()
$process.WaitForExit()
if ($process.ExitCode -ne 0) { Remove-Item -LiteralPath $target -Force; throw "Tworzenie kopii bazy nie powiodło się: $errorText" }
Get-ChildItem -LiteralPath $backupRoot -File -Filter "baza-konkurencyjnosci-*.dump" |
  Where-Object LastWriteTime -lt (Get-Date).AddDays(-$RetentionDays) |
  Remove-Item -Force
Write-Output $target
