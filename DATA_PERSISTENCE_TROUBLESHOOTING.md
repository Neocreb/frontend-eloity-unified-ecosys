# Data Persistence Troubleshooting Guide

## Issues Overview
This guide addresses the following data persistence issues:
1. Images attached to posts are not visible after refresh
2. Likes disappear after refresh
3. Comments can't be added
4. Stories can't be posted

## Root Causes and Solutions

### 1. Service Worker Caching Issues

#### Problem
The service worker may be caching HTML responses for API endpoints, causing JSON parsing errors when the frontend expects JSON data but receives HTML.

#### Solution
We've updated the service worker ([public/sw.js](file:///c:/Users/HP/.qoder/frontend-eloity-unified-ecosys-3/public/sw.js)) to properly handle API requests by:
- Adding checks for JSON content types to bypass caching
- Ensuring Supabase requests are not cached
- Improving handling of navigation vs API requests

#### Manual Fix Steps
1. Open Developer Tools (F12)
2. Go to the Application tab
3. Under Service Workers, click "Unregister"
4. Under Clear storage, click "Clear site data"
5. Refresh the page

### 2. Real-time Subscription Problems

#### Problem
Supabase real-time subscriptions may not be working correctly, preventing data updates from being received by the frontend.

#### Solution
Ensure proper subscription setup and error handling in the frontend code.

#### Manual Fix Steps
1. Check browser console for real-time errors
2. Verify that subscriptions are properly established
3. Look for errors related to:
   - Connection failures
   - Authentication issues
   - Channel subscription problems

### 3. Storage Policy Issues

#### Problem
Incorrect RLS (Row Level Security) policies may be preventing proper data access to storage buckets.

#### Solution
We've verified and corrected storage policies to ensure:
- Public read access for posts bucket
- Authenticated uploads allowed
- Owner-based update/delete permissions

#### Manual Fix Steps
1. Open the Supabase Dashboard
2. Navigate to Storage > Buckets
3. Check the posts bucket permissions
4. Ensure the following policies exist:
   - Public read access
   - Authenticated user upload access
   - Owner update/delete access

### 4. Data Synchronization Errors

#### Problem
Inconsistent data synchronization between frontend and backend can cause data to appear missing after refresh.

#### Solution
Implement proper error handling and data validation in frontend services.

## Step-by-Step Troubleshooting

### Step 1: Clear Browser Cache
1. Open Developer Tools (F12)
2. Go to Application tab
3. Under Storage, click "Clear storage"
4. Under Service Workers, click "Unregister"
5. Refresh the page

### Step 2: Check Network Requests
1. Open Developer Tools (F12)
2. Go to Network tab
3. Reproduce the issue (e.g., create a post with image)
4. Look for:
   - Failed requests (red entries)
   - Requests returning HTML instead of JSON
   - 400/401/403/500 status codes
   - Slow requests that might timeout

### Step 3: Verify Real-time Subscriptions
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for errors related to:
   ```
   Real-time subscription failed
   WebSocket connection error
   Channel subscription error
   ```
4. Check if subscriptions are properly established

### Step 4: Test Storage Access
1. Try uploading a file to verify storage works
2. Check if files are accessible after upload
3. Verify file URLs are correctly formed

### Step 5: Check Console Errors
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for JavaScript errors that might prevent:
   - Data rendering
   - Event handling
   - API calls

## Common Error Patterns and Solutions

### Pattern 1: JSON Parsing Errors
**Error**: `Unexpected token < in JSON at position 0`
**Cause**: API endpoint returning HTML instead of JSON
**Solution**: 
- Clear service worker cache
- Verify service worker is not caching API responses
- Check network requests to see what's being returned

### Pattern 2: 401/403 Authentication Errors
**Error**: `401 Unauthorized` or `403 Forbidden`
**Cause**: Authentication tokens expired or missing
**Solution**:
- Refresh the page to get new tokens
- Check if user is properly logged in
- Verify Supabase authentication setup

### Pattern 3: 400 Bad Request Errors
**Error**: `400 Bad Request`
**Cause**: Malformed requests or policy violations
**Solution**:
- Check request payloads
- Verify storage policies
- Ensure proper data formatting

### Pattern 4: Network Timeout Errors
**Error**: `Timeout` or `Network error`
**Cause**: Slow network or server issues
**Solution**:
- Check internet connection
- Retry the operation
- Check Supabase status

## Prevention Best Practices

### 1. Service Worker Management
- Always exclude API endpoints from caching
- Use proper content-type checks
- Test service worker behavior during development

### 2. Real-time Subscription Management
- Properly clean up subscriptions when components unmount
- Handle subscription errors gracefully
- Test real-time functionality regularly

### 3. Data Synchronization
- Implement proper error handling for data operations
- Use optimistic updates with rollback mechanisms
- Ensure consistent data structures between frontend and backend

### 4. Storage Access
- Verify storage policies regularly
- Test file upload/download functionality
- Monitor for policy violations

## Files Modified
1. [public/sw.js](file:///c:/Users/HP/.qoder/frontend-eloity-unified-ecosys-3/public/sw.js) - Updated service worker with better API handling
2. [scripts/fix-realtime-subscriptions.js](file:///c:/Users/HP/.qoder/frontend-eloity-unified-ecosys-3/scripts/fix-realtime-subscriptions.js) - Script to fix real-time subscription issues
3. [fix-posts-storage-policies.sql](file:///c:/Users/HP/.qoder/frontend-eloity-unified-ecosys-3/fix-posts-storage-policies.sql) - Storage policies (previously fixed)

## Expected Outcome
After following this troubleshooting guide:
- ✅ Images attached to posts should persist after refresh
- ✅ Likes should persist after refresh
- ✅ Comments should be addable and persistent
- ✅ Stories should be postable and visible
- ✅ Real-time updates should work correctly
- ✅ No caching issues should occur

## Additional Support
If issues persist after following this guide:
1. Check the browser console for specific error messages
2. Verify your Supabase configuration
3. Ensure all database migrations have been applied
4. Contact support with detailed error information