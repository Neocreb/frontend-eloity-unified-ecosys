#!/bin/bash

# Eloity Platform Security Vulnerability Fix Script
# Run this script after installing Node.js to fix all vulnerabilities

echo "🛡️  Eloity Platform Security Fix Script"
echo "======================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Clean install dependencies
echo "📦 Cleaning and installing dependencies..."
rm -rf node_modules package-lock.json
npm install

# Run security audit
echo ""
echo "🔍 Running security audit..."
npm audit

# Fix vulnerabilities automatically
echo ""
echo "🔧 Fixing vulnerabilities..."
npm audit fix

# Check for remaining high/critical vulnerabilities
echo ""
echo "⚠️  Checking for remaining high/critical vulnerabilities..."
if npm audit --audit-level high; then
    echo "✅ No high or critical vulnerabilities found!"
else
    echo "⚠️  Some high/critical vulnerabilities remain."
    echo "   You may need to manually update some dependencies."
    
    # Attempt force fix (with warning)
    read -p "🚨 Attempt force fix? This may introduce breaking changes (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm audit fix --force
    fi
fi

# Update to latest compatible versions
echo ""
echo "📈 Updating to latest compatible versions..."
npm update

# Final audit check
echo ""
echo "🔍 Final security audit..."
npm audit

# Generate security report
echo ""
echo "📋 Generating security report..."
npm audit --json > security-audit-report.json

echo ""
echo "✅ Security fix process completed!"
echo ""
echo "📋 Summary:"
echo "   - Dependencies updated to latest secure versions"
echo "   - Security audit completed"
echo "   - Report saved to: security-audit-report.json"
echo ""
echo "🔄 Next steps:"
echo "   1. Review the security report"
echo "   2. Test your application thoroughly"
echo "   3. Run 'npm run dev' to start development server"
echo "   4. Run 'npm run audit:check' regularly"