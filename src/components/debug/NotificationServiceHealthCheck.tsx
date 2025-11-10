import { useState, useEffect } from 'react';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';

export const NotificationServiceHealthCheck = () => {
  const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  const checkService = async () => {
    if (!user?.id) {
      setStatus('error');
      setMessage('No user ID available');
      return;
    }

    setStatus('checking');
    setMessage('Checking notification service...');

    try {
      // Test 1: Check if service methods exist
      if (typeof notificationService.getUserNotifications !== 'function') {
        throw new Error('getUserNotifications is not a function');
      }

      if (typeof notificationService.getUnreadCount !== 'function') {
        throw new Error('getUnreadCount is not a function');
      }

      if (typeof notificationService.markAsRead !== 'function') {
        throw new Error('markAsRead is not a function');
      }

      if (typeof notificationService.markAllAsRead !== 'function') {
        throw new Error('markAllAsRead is not a function');
      }

      if (typeof notificationService.createNotification !== 'function') {
        throw new Error('createNotification is not a function');
      }

      // Test 2: Try to call a method
      const notifications = await notificationService.getUserNotifications(user.id);
      setMessage(`Service is working! Found ${notifications.length} notifications.`);
      setStatus('success');
    } catch (error) {
      console.error('Notification service check failed:', error);
      setMessage(`Error: ${(error as Error).message}`);
      setStatus('error');
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">Notification Service Health Check</h3>
      <p className="mb-2">Status: {status}</p>
      <p className="mb-2">Message: {message}</p>
      <button 
        onClick={checkService}
        disabled={status === 'checking'}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {status === 'checking' ? 'Checking...' : 'Run Health Check'}
      </button>
    </div>
  );
};