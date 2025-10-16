# Notification System Implementation

## Overview

The notification system provides real-time notifications to users through multiple channels including in-app notifications, browser notifications, email, and SMS. The system is built on top of Supabase real-time subscriptions and integrates with user preferences for granular control.

## Architecture

### Core Components

1. **Notification Service** (`notificationService.ts`) - Handles database operations for notifications
2. **Real-time Notification Service** (`realtimeNotificationService.ts`) - Manages real-time subscriptions and browser notifications
3. **Notification Settings Service** (`notificationSettingsService.ts`) - Manages user notification preferences
4. **Notification Hooks** (`useRealtimeNotifications.ts`, `useNotificationSettings.ts`) - React hooks for using the services
5. **UI Components** - NotificationSystem, NotificationCenter, NotificationSettings

### Database Schema

The system uses the following database tables:

- `notifications` - Core notification storage
- `notification_preferences` - User-specific notification settings
- `notification_templates` - Templates for different notification types
- `push_notifications` - Push notification delivery tracking
- `sms_notifications` - SMS notification delivery tracking
- `email_notifications` - Email notification delivery tracking

## Features Implemented

### 1. Real-time Notifications
- Supabase real-time subscriptions for instant notification delivery
- Browser notification support with permission management
- Priority-based notification handling

### 2. Notification Preferences
- Granular control over notification types (social, trading, marketplace, etc.)
- Channel-specific enable/disable (push, email, SMS, in-app)
- Quiet hours configuration
- Frequency settings (instant, hourly, daily, weekly digests)

### 3. Notification Management
- Mark individual notifications as read
- Mark all notifications as read
- Delete notifications
- Filter by read/unread status

### 4. Multi-channel Delivery
- In-app notifications (default)
- Browser push notifications
- Email notifications (planned)
- SMS notifications (planned)

## Usage

### Displaying Notifications

```tsx
import { NotificationSystem } from '@/components/notifications/NotificationSystem';

// In your layout component
<NotificationSystem />
```

### Using Notification Hooks

```tsx
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

const MyComponent = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    sendTestNotification 
  } = useRealtimeNotifications();

  // Send a test notification
  const handleSendTest = async () => {
    await sendTestNotification({
      title: 'Test Notification',
      content: 'This is a test notification',
      type: 'system'
    });
  };

  return (
    <div>
      <h2>You have {unreadCount} unread notifications</h2>
      {/* Render notifications */}
    </div>
  );
};
```

### Managing Notification Settings

```tsx
import { useNotificationSettings } from '@/hooks/useNotificationSettings';

const NotificationSettingsComponent = () => {
  const { 
    preferences, 
    updatePreferences, 
    updateCategory 
  } = useNotificationSettings();

  const togglePushNotifications = async () => {
    await updatePreferences({
      push_enabled: !preferences?.push_enabled
    });
  };

  return (
    <div>
      {/* Settings UI */}
    </div>
  );
};
```

## Integration Points

### Creating Notifications

Notifications can be created from any service using the notification service:

```ts
import { notificationService } from '@/services/notificationService';

// Create a notification
const notificationId = await notificationService.createNotification(
  userId,
  'like',
  'New Like',
  'Someone liked your post'
);
```

### Checking Notification Preferences

Before sending notifications, check user preferences:

```ts
import { notificationSettingsService } from '@/services/notificationSettingsService';

const isEnabled = await notificationSettingsService.isNotificationTypeEnabled(
  userId,
  'social'
);
```

## Future Enhancements

### Email Notifications
- Integration with email service providers
- HTML email templates
- Unsubscribe management

### SMS Notifications
- Integration with SMS providers (Twilio, etc.)
- SMS templates
- Delivery tracking

### Advanced Features
- Notification scheduling
- Personalized notification content
- A/B testing for notification effectiveness
- Analytics dashboard for notification performance

## Testing

The notification system includes comprehensive tests covering:
- Notification display and management
- Real-time subscription handling
- Preference management
- Error handling and edge cases

Run tests with:
```bash
npm test notificationSystem
```

## Troubleshooting

### Common Issues

1. **Notifications not appearing**
   - Check if user has granted browser notification permissions
   - Verify notification preferences are enabled
   - Ensure real-time subscriptions are working

2. **Preferences not saving**
   - Check database connectivity
   - Verify user authentication
   - Check for validation errors

3. **Real-time notifications not working**
   - Verify Supabase real-time is enabled
   - Check network connectivity
   - Ensure correct channel subscription

### Debugging

Enable debug logging by setting:
```ts
localStorage.setItem('debug', 'notification-system:*');
```