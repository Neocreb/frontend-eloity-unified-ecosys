#!/bin/bash

# Fix all Badge imports to use the UI index
echo "Fixing Badge imports across all TypeScript files..."

# Find and replace Badge imports in all .tsx and .ts files
find src -name "*.tsx" -type f -exec sed -i 's|from "@/components/ui/badge"|from "@/components/ui"|g' {} +
find src -name "*.ts" -type f -exec sed -i 's|from "@/components/ui/badge"|from "@/components/ui"|g' {} +

echo "✅ Fixed all Badge imports to use UI index"
echo "Files updated:"
grep -r "from \"@/components/ui\"" src --include="*.tsx" --include="*.ts" | grep Badge | wc -l
echo "badge imports now using correct path"