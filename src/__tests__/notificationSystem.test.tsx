import { render, screen, waitFor } from '@testing-library/react';
import { NotificationSystem } from '@/components/notifications/NotificationSystem';
import { UnifiedNotificationProvider } from '@/contexts/UnifiedNotificationContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { notificationService } from '@/services/notificationService';
import { realtimeNotificationService } from '@/services/realtimeNotificationService';
import { notificationSettingsService } from '@/services/notificationSettingsService';
import userEvent from '@testing-library/user-event';

// Mock the Supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    rpc: jest.fn().mockReturnThis(),
    channel: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockReturnThis(),
    getChannels: jest.fn().mockReturnValue([]),
    removeChannel: jest.fn(),
  },
}));

// Mock the notification services
jest.mock('@/services/notificationService', () => ({
  notificationService: {
    getUserNotifications: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    createNotification: jest.fn(),
  },
}));

jest.mock('@/services/realtimeNotificationService', () => ({
  realtimeNotificationService: {
    initialize: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    cleanup: jest.fn(),
    sendTestNotification: jest.fn(),
  },
}));

jest.mock('@/services/notificationSettingsService', () => ({
  notificationSettingsService: {
    getUserPreferences: jest.fn(),
    createDefaultPreferences: jest.fn(),
    updateUserPreferences: jest.fn(),
  },
}));

// Mock AuthContext
const mockUser = { id: 'test-user-id', email: 'test@example.com' };
const mockAuthContext = {
  user: mockUser,
  login: jest.fn(),
  logout: jest.fn(),
  loading: false,
};

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock use-toast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock Notification API
Object.defineProperty(window, 'Notification', {
  value: {
    permission: 'granted',
    requestPermission: jest.fn().mockResolvedValue('granted'),
  },
  writable: true,
});

describe('Notification System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders notification system with unread count', async () => {
    // Mock notification data
    const mockNotifications = [
      {
        id: '1',
        user_id: 'test-user-id',
        type: 'like',
        title: 'Test Notification',
        content: 'This is a test notification',
        read: false,
        created_at: new Date().toISOString(),
      },
    ];

    (notificationService.getUserNotifications as jest.Mock).mockResolvedValue(mockNotifications);

    render(
      <AuthProvider>
        <UnifiedNotificationProvider>
          <NotificationSystem />
        </UnifiedNotificationProvider>
      </AuthProvider>
    );

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  test('shows no notifications when empty', async () => {
    (notificationService.getUserNotifications as jest.Mock).mockResolvedValue([]);

    render(
      <AuthProvider>
        <UnifiedNotificationProvider>
          <NotificationSystem />
        </UnifiedNotificationProvider>
      </AuthProvider>
    );

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('No notifications')).toBeInTheDocument();
    });
  });

  test('handles notification creation', async () => {
    const mockNotificationId = 'test-notification-id';
    (notificationService.createNotification as jest.Mock).mockResolvedValue(mockNotificationId);

    const TestComponent = () => {
      const { sendTestNotification } = useRealtimeNotifications();
      
      return (
        <button 
          onClick={() => sendTestNotification({ 
            title: 'Test', 
            content: 'Test content' 
          })}
        >
          Send Test
        </button>
      );
    };

    render(
      <AuthProvider>
        <UnifiedNotificationProvider>
          <TestComponent />
        </UnifiedNotificationProvider>
      </AuthProvider>
    );

    // Click the button to send a test notification
    await userEvent.click(screen.getByText('Send Test'));

    // Verify the notification service was called
    expect(notificationService.createNotification).toHaveBeenCalledWith(
      'test-user-id',
      'system',
      'Test',
      'Test content'
    );
  });

  test('initializes real-time notifications', async () => {
    render(
      <AuthProvider>
        <UnifiedNotificationProvider>
          <NotificationSystem />
        </UnifiedNotificationProvider>
      </AuthProvider>
    );

    // Wait for initialization
    await waitFor(() => {
      expect(realtimeNotificationService.initialize).toHaveBeenCalledWith('test-user-id');
    });
  });

  test('loads notification preferences', async () => {
    const mockPreferences = {
      user_id: 'test-user-id',
      global_enabled: true,
      push_enabled: true,
      email_enabled: true,
      sms_enabled: false,
      in_app_enabled: true,
      frequency: 'instant',
      language: 'en',
      preferences: {
        social: true,
        trading: true,
      },
    };

    (notificationSettingsService.getUserPreferences as jest.Mock).mockResolvedValue(mockPreferences);

    render(
      <AuthProvider>
        <UnifiedNotificationProvider>
          <NotificationSystem />
        </UnifiedNotificationProvider>
      </AuthProvider>
    );

    // The preferences should be loaded (we can't directly test this without exposing the state)
    await waitFor(() => {
      expect(notificationSettingsService.getUserPreferences).toHaveBeenCalledWith('test-user-id');
    });
  });
});