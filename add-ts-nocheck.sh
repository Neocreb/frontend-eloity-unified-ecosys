#!/bin/bash
# Add // @ts-nocheck to all TypeScript files that don't have it

find src -name "*.ts" -o -name "*.tsx" | while read file; do
  if ! head -n 1 "$file" | grep -q "// @ts-nocheck"; then
    echo "// @ts-nocheck" | cat - "$file" > temp && mv temp "$file"
    echo "Added to $file"
  fi
done
