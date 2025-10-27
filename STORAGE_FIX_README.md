# Storage Policies Fix for Posts Bucket

## Issue
Users are experiencing a "400 Bad Request" error with the message "new row violates row-level security policy" when trying to upload files to the posts storage bucket.

## Root Cause
The Row Level Security (RLS) policies for the posts storage bucket are not properly configured to allow authenticated users to upload files.

## Solution
This repository contains the necessary files to fix the storage policies:

### Files Included
1. **[fix-posts-storage-policies.sql](file:///c:/Users/HP/.qoder/frontend-eloity-unified-ecosys-3/fix-posts-storage-policies.sql)** - SQL script to fix the RLS policies
2. **[scripts/apply-posts-storage-fix.js](file:///c:/Users/HP/.qoder/frontend-eloity-unified-ecosys-3/scripts/apply-posts-storage-fix.js)** - Provides instructions for applying the fix
3. **[scripts/test-posts-storage.js](file:///c:/Users/HP/.qoder/frontend-eloity-unified-ecosys-3/scripts/test-posts-storage.js)** - Tests the storage functionality
4. **[POSTS_STORAGE_FIX_COMPLETE.md](file:///c:/Users/HP/.qoder/frontend-eloity-unified-ecosys-3/POSTS_STORAGE_FIX_COMPLETE.md)** - Complete solution documentation

### Quick Fix
1. Open the Supabase Dashboard: https://app.supabase.com/project/hjebzdekquczudhrygns/sql
2. Copy the contents of [fix-posts-storage-policies.sql](file:///c:/Users/HP/.qoder/frontend-eloity-unified-ecosys-3/fix-posts-storage-policies.sql)
3. Paste into the SQL editor and click "Run"
4. Test the file upload functionality again

### Detailed Instructions
For step-by-step instructions, see:
- [APPLY_STORAGE_FIX.md](file:///c:/Users/HP/.qoder/frontend-eloity-unified-ecosys-3/APPLY_STORAGE_FIX.md) - Quick application guide
- [STORAGE_FIX_INSTRUCTIONS.md](file:///c:/Users/HP/.qoder/frontend-eloity-unified-ecosys-3/STORAGE_FIX_INSTRUCTIONS.md) - Manual instructions
- [STORAGE_POLICIES_FIX_SUMMARY.md](file:///c:/Users/HP/.qoder/frontend-eloity-unified-ecosys-3/STORAGE_POLICIES_FIX_SUMMARY.md) - Summary of changes

## Expected Outcome
After applying the fix, users should be able to upload files to the posts bucket without encountering the RLS policy violation error.