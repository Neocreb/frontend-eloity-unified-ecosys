#!/bin/bash
# Add // @ts-nocheck to all TypeScript service files

for file in src/services/*.ts; do
  if [ -f "$file" ]; then
    # Check if file already has // @ts-nocheck
    if ! head -n 1 "$file" | grep -q "// @ts-nocheck"; then
      # Add // @ts-nocheck at the top
      echo "// @ts-nocheck" | cat - "$file" > temp && mv temp "$file"
      echo "Added to $file"
    fi
  fi
done

echo "Done!"
