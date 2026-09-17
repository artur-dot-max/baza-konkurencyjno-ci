param([Parameter(Mandatory = $true)][string]$BackupFile)

$ErrorActionPreference = "Stop"
$resolved = (Resolve-Path -LiteralPath $BackupFile).Path
if (-not $resolved.EndsWith(".dump", [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Oczekiwano pliku .dump"
}
$start = [System.Diagnostics.ProcessStartInfo]::new("docker")
$start.ArgumentList.Add("compose")
$start.ArgumentList.Add("exec")
$start.ArgumentList.Add("-T")
$start.ArgumentList.Add("db")
$start.ArgumentList.Add("sh")
$start.ArgumentList.Add("-c")
$start.ArgumentList.Add('pg_restore --clean --if-exists --no-owner -U "$POSTGRES_USER" -d "$POSTGRES_DB"')
$start.UseShellExecute = $false
$start.RedirectStandardInput = $true
$start.RedirectStandardError = $true
$process = [System.Diagnostics.Process]::Start($start)
try {
  $input = [System.IO.File]::OpenRead($resolved)
  $input.CopyTo($process.StandardInput.BaseStream)
  $process.StandardInput.Close()
  $input.Dispose()
  $errorText = $process.StandardError.ReadToEnd()
  $process.WaitForExit()
  if ($process.ExitCode -ne 0) { throw "Odtwarzanie bazy nie powiodło się: $errorText" }
} finally {
  if (-not $process.HasExited) { $process.Kill() }
}
