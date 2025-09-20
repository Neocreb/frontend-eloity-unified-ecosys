# Eloity Platform Security Vulnerability Fix Script (PowerShell)
# Run this script after installing Node.js to fix all vulnerabilities

Write-Host "🛡️  Eloity Platform Security Fix Script" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Clean install dependencies
Write-Host "📦 Cleaning and installing dependencies..." -ForegroundColor Blue
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
}
npm install

# Run security audit
Write-Host ""
Write-Host "🔍 Running security audit..." -ForegroundColor Blue
npm audit

# Fix vulnerabilities automatically
Write-Host ""
Write-Host "🔧 Fixing vulnerabilities..." -ForegroundColor Blue
npm audit fix

# Check for remaining high/critical vulnerabilities
Write-Host ""
Write-Host "⚠️  Checking for remaining high/critical vulnerabilities..." -ForegroundColor Yellow
$auditResult = npm audit --audit-level high 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ No high or critical vulnerabilities found!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some high/critical vulnerabilities remain." -ForegroundColor Yellow
    Write-Host "   You may need to manually update some dependencies." -ForegroundColor Yellow
    
    # Attempt force fix (with warning)
    $forcefix = Read-Host "🚨 Attempt force fix? This may introduce breaking changes (y/N)"
    if ($forcefix -eq "y" -or $forcefix -eq "Y") {
        npm audit fix --force
    }
}

# Update to latest compatible versions
Write-Host ""
Write-Host "📈 Updating to latest compatible versions..." -ForegroundColor Blue
npm update

# Final audit check
Write-Host ""
Write-Host "🔍 Final security audit..." -ForegroundColor Blue
npm audit

# Generate security report
Write-Host ""
Write-Host "📋 Generating security report..." -ForegroundColor Blue
npm audit --json | Out-File -FilePath "security-audit-report.json" -Encoding UTF8

Write-Host ""
Write-Host "✅ Security fix process completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "   - Dependencies updated to latest secure versions" -ForegroundColor White
Write-Host "   - Security audit completed" -ForegroundColor White
Write-Host "   - Report saved to: security-audit-report.json" -ForegroundColor White
Write-Host ""
Write-Host "🔄 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Review the security report" -ForegroundColor White
Write-Host "   2. Test your application thoroughly" -ForegroundColor White
Write-Host "   3. Run 'npm run dev' to start development server" -ForegroundColor White
Write-Host "   4. Run 'npm run audit:check' regularly" -ForegroundColor White