# ============================================================
#  Git_Push.ps1 - Sync nhanh len GitHub (web public)
#  Cach dung:
#    .\git_push.ps1                 -> commit mac dinh "upd" + push
#    .\git_push.ps1 "Them chuyen de"
# ============================================================
param(
    [string]$Message = ""
)

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

if ([string]::IsNullOrWhiteSpace($Message)) {
    $Message = "upd " + (Get-Date -Format "yyyy-MM-dd HH:mm")
}

Write-Host ""
Write-Host "==> git add -A" -ForegroundColor Cyan
git add -A

Write-Host ""
Write-Host "==> git commit -m ""$Message""" -ForegroundColor Cyan
git commit -m $Message

Write-Host ""
Write-Host "==> git push origin main" -ForegroundColor Cyan
git push origin main

Write-Host ""
Write-Host "DONE - Da dong bo len GitHub!" -ForegroundColor Green