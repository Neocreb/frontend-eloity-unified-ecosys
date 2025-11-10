/**
 * Debug utility for notification service
 * Helps verify that the notification service is properly imported and initialized
 */

import { notificationService } from "@/services/notificationService";

export const debugNotificationService = () => {
  console.log("=== Notification Service Debug Info ===");
  
  // Check if notificationService is defined
  if (!notificationService) {
    console.error("notificationService is undefined!");
    return;
  }
  
  // Check if methods exist
  const methods = [
    'getUserNotifications',
    'getUnreadCount',
    'markAsRead',
    'markAllAsRead',
    'createNotification',
    'sendUserNotification',
    'sendGroupNotification'
  ];
  
  methods.forEach(method => {
    if (typeof (notificationService as any)[method] === 'function') {
      console.log(`✓ ${method}: function`);
    } else {
      console.error(`✗ ${method}: not a function`);
    }
  });
  
  console.log("=====================================");
};

// Run debug on import
debugNotificationService();

export default debugNotificationService;