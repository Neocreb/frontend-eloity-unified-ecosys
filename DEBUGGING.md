# Debugging Tools

This document describes the debugging tools that have been added to help resolve issues with the notification service.

## Scripts

### 1. Notification Service Verification
Verifies that all required methods exist in the notification service.

```bash
npm run verify-notification-service
```

### 2. Clear Cache
Clears the Vite cache and dist directory.

```bash
npm run clear-cache
```

### 3. Restart Development Server
Clears cache and restarts the development server.

```bash
npm run restart-dev
```

## Debug Components

### NotificationServiceHealthCheck
A React component that can be used to test the notification service methods at runtime.

### Debug Page
A dedicated page at `/debug` that includes the NotificationServiceHealthCheck component.

## Utility Functions

### debugNotificationService
A utility function that logs debug information about the notification service when imported.

## Troubleshooting Steps

1. Run the verification script to ensure all methods exist:
   ```bash
   npm run verify-notification-service
   ```

2. Clear the cache if there are bundling issues:
   ```bash
   npm run clear-cache
   ```

3. Restart the development server:
   ```bash
   npm run restart-dev
   ```

4. Visit the debug page at `/debug` to test the notification service at runtime.

5. Check the browser console for debug output from the debugNotificationService utility.