#!/usr/bin/env pwsh
# Sync data from Zoho CRM to Supabase
# Usage: .\sync.ps1 [entity]
# entity: all (default), contacts, accounts, properties, units

param(
    [string]$entity = "all"
)

Write-Host "Starting sync for: $entity" -ForegroundColor Cyan

$url = "https://unionspacescore.vercel.app/api/sync"
$body = @{
    entity = $entity
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "`nSync completed successfully!" -ForegroundColor Green
    Write-Host "Results:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10 | Write-Host
    
    if ($response.results) {
        Write-Host "`nRecords synced:" -ForegroundColor Cyan
        if ($response.results.contacts) {
            Write-Host "  Contacts: $($response.results.contacts.synced)" -ForegroundColor White
        }
        if ($response.results.accounts) {
            Write-Host "  Accounts: $($response.results.accounts.synced)" -ForegroundColor White
        }
        if ($response.results.properties) {
            Write-Host "  Properties: $($response.results.properties.synced)" -ForegroundColor White
        }
        if ($response.results.units) {
            Write-Host "  Units: $($response.results.units.synced)" -ForegroundColor White
        }
    }
    
    Write-Host "`nYou can now refresh the app to see the data!" -ForegroundColor Green
    
} catch {
    Write-Host "`nSync failed!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}
