# 1. Ensure Node v22 via fnm
fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression
fnm use 22

# 2. Bootstrap expo if missing
if (-not (Test-Path -Path "./node_modules/expo")) {
    Write-Host "expo package not found—installing expo@latest via npm..."
    npm install expo
}

# 3. Install Expo dependencies from expo-requirements.txt
Get-Content .\expo-requirements.txt | ForEach-Object {
    $pkg = $_.Trim()
    if (-not [string]::IsNullOrWhiteSpace($pkg) -and -not $pkg.StartsWith("#")) {
        Write-Host "Installing $pkg..."
        expo install $pkg
    }
}

Write-Host "All dependencies installed!"