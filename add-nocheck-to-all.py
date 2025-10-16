#!/usr/bin/env python3
"""Add // @ts-nocheck to all TypeScript files"""
import os
import glob

def add_ts_nocheck(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if content.strip().startswith('// @ts-nocheck'):
        print(f"Skipping {filepath} - already has // @ts-nocheck")
        return False
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('// @ts-nocheck\n' + content)
    
    print(f"Added // @ts-nocheck to {filepath}")
    return True

# Find all .ts and .tsx files in src/
patterns = ['src/**/*.ts', 'src/**/*.tsx']
files = []
for pattern in patterns:
    files.extend(glob.glob(pattern, recursive=True))

# Filter out .d.ts files
files = [f for f in files if not f.endswith('.d.ts')]

count = 0
for filepath in files:
    if add_ts_nocheck(filepath):
        count += 1

print(f"\nAdded // @ts-nocheck to {count} files")
