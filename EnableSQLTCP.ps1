# ─────────────────────────────────────────────────────────────────────────────
# EnableSQLTCP.ps1
# Run this script ONCE as Administrator to enable TCP/IP on SQL Server Express
# Right-click this file → "Run with PowerShell" → Yes to UAC prompt
# ─────────────────────────────────────────────────────────────────────────────

Write-Host "Enabling TCP/IP for SQL Server Express..." -ForegroundColor Cyan

# Enable TCP/IP in registry
$paths = @(
    'HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL17.SQLEXPRESS\MSSQLServer\SuperSocketNetLib\Tcp',
    'HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\SQLEXPRESS\MSSQLServer\SuperSocketNetLib\Tcp'
)
foreach ($p in $paths) {
    if (Test-Path $p) {
        Set-ItemProperty -Path $p -Name 'Enabled' -Value 1 -Force
        Write-Host "  Enabled TCP at: $p" -ForegroundColor Green
    }
}

# Restart SQL Server Express
Write-Host "Restarting SQL Server Express..." -ForegroundColor Cyan
try {
    Restart-Service -Name 'MSSQL$SQLEXPRESS' -Force
    Start-Sleep -Seconds 3
    $svc = Get-Service 'MSSQL$SQLEXPRESS'
    Write-Host "  SQL Server status: $($svc.Status)" -ForegroundColor Green
} catch {
    Write-Host "  Could not restart automatically. Please restart manually:" -ForegroundColor Yellow
    Write-Host "  Open Services (Win+R → services.msc) → find 'SQL Server (SQLEXPRESS)' → Restart" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Done! Now go back to VS Code and the server should connect." -ForegroundColor Green
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
