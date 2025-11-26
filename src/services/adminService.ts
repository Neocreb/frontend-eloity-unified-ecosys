// @ts-nocheck
import { supabase } from "@/lib/supabase/client";
import {
  AdminRole,
  AdminUser,
  AdminPermission,
  AdminStats,
  ContentModerationItem,
  AdminActivityLog,
  PlatformSetting,
  AdminDashboardData,
  AdminLoginCredentials,
  AdminSession,
} from "@/types/admin";

export class AdminService {
  // Authentication methods
  static async adminLogin(credentials: AdminLoginCredentials): Promise<{
    success: boolean;
    user?: AdminUser;
    session?: AdminSession;
    error?: string;
  }> {
    try {
      // Try regular Supabase authentication
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: "Authentication failed" };
      }

      // Check if user has admin permissions
      const adminUser = await this.getAdminUser(authData.user.id);
      if (!adminUser || !adminUser.isActive) {
        await supabase.auth.signOut();
        return {
          success: false,
          error: "Access denied. Admin privileges required.",
        };
      }

      // Create admin session
      const session = await this.createAdminSession(authData.user.id);

      // Log admin login
      await this.logAdminActivity({
        adminId: authData.user.id,
        action: "admin_login",
        targetType: "session",
        details: { ip: window.location.hostname },
      });

      return { success: true, user: adminUser, session };
    } catch (error) {
      console.error("Admin login error:", error);
      return { success: false, error: "Login failed" };
    }
  }

  static async adminLogout(sessionToken: string): Promise<void> {
    try {
      // Deactivate admin session
      await supabase
        .from('admin_sessions')
        .update({ is_active: false })
        .eq('session_token', sessionToken);

      // Sign out from Supabase
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Admin logout error:", error);
    }
  }

  // Admin user management
  static async getAdminUser(userId: string): Promise<AdminUser | null> {
    try {
      // First try the API endpoint
      const response = await fetch(`/api/admin/users/${userId}`, {
        headers: {
          "Authorization": `Bearer ${this.getAuthToken()}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return result.data;
        }
      }

      // If API fails, try Supabase directly
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error("Error fetching admin user from Supabase:", error);
        return null;
      }

      if (!data) {
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        avatar: data.avatar_url,
        roles: data.roles,
        permissions: data.permissions,
        isActive: data.is_active,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error("Error fetching admin user:", error);
      return null;
    }
  }

  static async createAdminUser(
    email: string,
    roles: AdminRole[],
    grantedBy: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ email, roles, grantedBy })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error creating admin user:", error);
      return { success: false, error: "Failed to create admin user" };
    }
  }

  static async getAllAdminUsers(): Promise<AdminUser[]> {
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          "Authorization": `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.users || [];
    } catch (error) {
      console.error("Error fetching admin users:", error);
      return [];
    }
  }

  // Permission management
  static async grantAdminRole(
    userId: string,
    role: AdminRole,
    grantedBy: string,
  ): Promise<void> {
    const permissions = this.getRolePermissions(role);

    await fetch(`/api/admin/users/${userId}/roles`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify({ role, permissions, grantedBy })
    });
  }

  static async revokeAdminRole(
    userId: string,
    role: AdminRole,
    revokedBy: string,
  ): Promise<void> {
    await fetch(`/api/admin/users/${userId}/roles/${role}`, {
      method: 'DELETE',
      headers: {
        "Authorization": `Bearer ${this.getAuthToken()}`
      }
    });

    await this.logAdminActivity({
      adminId: revokedBy,
      action: "revoke_admin_role",
      targetType: "user",
      targetId: userId,
      details: { role },
    });
  }

  static async hasPermission(
    userId: string,
    permission: string,
  ): Promise<boolean> {
    try {
      const response = await fetch(`/api/admin/users/${userId}/permissions/${permission}`, {
        headers: {
          "Authorization": `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) return false;

      const result = await response.json();
      return result.hasPermission || false;
    } catch (error) {
      console.error("Error checking permission:", error);
      return false;
    }
  }

  // Dashboard data
  static async getDashboardData(): Promise<AdminDashboardData> {
    try {
      // Use the real API endpoint
      const response = await fetch("/api/admin/dashboard", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch dashboard data");
      }

      return result.dashboard;
    } catch (error) {
      console.error("Error fetching dashboard data:", error);

      // Fallback to mock data if API fails
      return {
        stats: {
          totalUsers: 1247,
          activeUsers: 892,
          totalPosts: 0,
          totalProducts: 156,
          totalJobs: 89,
          totalTrades: 234,
          pendingModeration: 12,
          revenueToday: 0,
          revenueMonth: 48500,
        },
        recentActivity: [
          {
            id: "1",
            adminId: "demo-admin-001",
            adminName: "Demo Admin",
            action: "user_verification",
            targetType: "user",
            createdAt: new Date().toISOString(),
          },
        ],
        pendingModeration: [
          {
            id: "mock-1",
            contentId: "content-123",
            contentType: "post",
            status: "pending",
            reason: "Inappropriate content",
            description: "User reported this post for containing inappropriate language",
            priority: "medium",
            reportedBy: "user-456",
            autoDetected: false,
            confidence: 0.8,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            reviewedBy: undefined,
            reviewedAt: undefined,
            reviewNotes: undefined,
          },
          {
            id: "mock-2",
            contentId: "content-789",
            contentType: "comment",
            status: "pending",
            reason: "Spam",
            description: "Automated detection flagged this as potential spam",
            priority: "high",
            reportedBy: undefined,
            autoDetected: true,
            confidence: 0.95,
            createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            reviewedBy: undefined,
            reviewedAt: undefined,
            reviewNotes: undefined,
          },
        ],
        activeAdmins: [
          {
            id: "demo-admin-001",
            name: "Demo Administrator",
            email: "admin@eloity.com",
            roles: ["super_admin"],
            permissions: [],
            isActive: true,
            createdAt: new Date().toISOString(),
          },
        ],
        systemHealth: {
          cpu: 45,
          memory: 62,
          storage: 78,
          apiLatency: 120,
          errorRate: 0.02,
        },
      };
    }
  }

  static async getAdminStats(): Promise<AdminStats> {
    try {
      const response = await fetch("/api/admin/dashboard", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch admin stats");
      }

      return result.dashboard.stats;
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalPosts: 0,
        totalProducts: 0,
        totalJobs: 0,
        totalTrades: 0,
        pendingModeration: 0,
        revenueToday: 0,
        revenueMonth: 0,
      };
    }
  }

  // Activity logging
  static async logAdminActivity(
    activity: Omit<AdminActivityLog, "id" | "adminName" | "createdAt">,
  ): Promise<void> {
    try {
      await fetch('/api/admin/activity', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          ...activity,
          createdAt: new Date().toISOString(),
        })
      });
    } catch (error) {
      console.error("Error logging admin activity:", error);
    }
  }

  static async getRecentActivity(
    limit: number = 50,
  ): Promise<AdminActivityLog[]> {
    try {
      const response = await fetch(`/api/admin/activity?limit=${limit}`, {
        headers: {
          "Authorization": `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.activities || [];
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      return [];
    }
  }

  // Content moderation
  static async getPendingModeration(): Promise<ContentModerationItem[]> {
    try {
      // First try the API endpoint
      const response = await fetch('/api/admin/moderation/pending', {
        headers: {
          "Authorization": `Bearer ${this.getAuthToken()}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return result.data || [];
        }
      }
      
      // If API fails, try Supabase directly
      const { data, error } = await supabase
        .from('flagged_messages')
        .select(`
          *,
          message:chat_messages(content, sender_id)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching pending moderation from Supabase:", error);
        return this.getMockModerationItems();
      }

      // Transform Supabase data to match expected format
      return data.map(item => ({
        id: item.id,
        contentId: item.message_id,
        contentType: 'message',
        status: item.status,
        reason: item.reason,
        description: item.description,
        priority: item.priority,
        reportedBy: item.reporter_id,
        autoDetected: item.auto_detected,
        confidence: item.confidence_score,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        reviewedBy: item.reviewed_by,
        reviewedAt: item.reviewed_at,
        reviewNotes: item.review_notes,
      }));
    } catch (error) {
      console.error("Error fetching pending moderation:", error);
      return this.getMockModerationItems();
    }
  }

  // Mock data for when the database table doesn't exist
  private static getMockModerationItems(): ContentModerationItem[] {
    return [
      {
        id: "mock-1",
        contentId: "content-123",
        contentType: "post",
        status: "pending",
        reason: "Inappropriate content",
        description: "User reported this post for containing inappropriate language",
        priority: "medium",
        reportedBy: "user-456",
        autoDetected: false,
        confidence: 0.8,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        reviewedBy: undefined,
        reviewedAt: undefined,
        reviewNotes: undefined,
      },
      {
        id: "mock-2",
        contentId: "content-789",
        contentType: "comment",
        status: "pending",
        reason: "Spam",
        description: "Automated detection flagged this as potential spam",
        priority: "high",
        reportedBy: undefined,
        autoDetected: true,
        confidence: 0.95,
        createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        reviewedBy: undefined,
        reviewedAt: undefined,
        reviewNotes: undefined,
      },
    ];
  }

  static async moderateContent(
    itemId: string,
    action: "approve" | "reject" | "remove",
    reviewedBy: string,
    notes?: string,
  ): Promise<void> {
    try {
      // Update the flagged message status
      const status = action === "approve" ? "approved" : 
                    action === "reject" ? "rejected" : "resolved";
      
      const { error } = await supabase
        .from('flagged_messages')
        .update({
          status,
          reviewed_by: reviewedBy,
          reviewed_at: new Date().toISOString(),
          review_notes: notes
        })
        .eq('id', itemId);

      if (error) {
        console.error("Error moderating content:", error);
        throw error;
      }

      // Log the activity
      await this.logAdminActivity({
        adminId: reviewedBy,
        action: `moderate_content_${action}`,
        targetType: "moderation",
        targetId: itemId,
        details: { notes },
      });
    } catch (error) {
      console.error("Error moderating content:", error);
      throw error;
    }
  }

  // Platform settings
  static async getPlatformSettings(
    category?: string,
  ): Promise<PlatformSetting[]> {
    try {
      // First try the API endpoint
      const url = category 
        ? `/api/admin/settings?category=${category}`
        : '/api/admin/settings';
        
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${this.getAuthToken()}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return result.data || [];
        }
      }
      
      // If API fails, try Supabase directly
      let query = supabase
        .from('platform_settings')
        .select('*');

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching platform settings from Supabase:", error);
        // Return mock data as fallback
        return [
          {
            id: "setting-1",
            key: "platform_name",
            value: "Eloity Platform",
            category: "general",
            description: "Platform display name",
            isPublic: true,
            lastModifiedBy: "system",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "setting-2",
            key: "maintenance_mode",
            value: false,
            category: "general",
            description: "Enable maintenance mode",
            isPublic: false,
            lastModifiedBy: "system",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ];
      }

      // Transform Supabase data to match expected format
      return data.map(setting => ({
        id: setting.id,
        key: setting.key,
        value: typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value,
        category: setting.category,
        description: setting.description,
        isPublic: setting.is_public,
        lastModifiedBy: setting.last_modified_by,
        createdAt: setting.created_at,
        updatedAt: setting.updated_at,
      }));
    } catch (error) {
      console.error("Error fetching platform settings:", error);
      // Return mock data as fallback
      return [
        {
          id: "setting-1",
          key: "platform_name",
          value: "Eloity Platform",
          category: "general",
          description: "Platform display name",
          isPublic: true,
          lastModifiedBy: "system",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "setting-2",
          key: "maintenance_mode",
          value: false,
          category: "general",
          description: "Enable maintenance mode",
          isPublic: false,
          lastModifiedBy: "system",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];
    }
  }

  static async updatePlatformSetting(
    key: string,
    value: any,
    modifiedBy: string,
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('platform_settings')
        .update({
          value: JSON.stringify(value),
          last_modified_by: modifiedBy,
          updated_at: new Date().toISOString()
        })
        .eq('key', key);

      if (error) {
        console.error("Error updating platform setting:", error);
        throw error;
      }

      await this.logAdminActivity({
        adminId: modifiedBy,
        action: "update_setting",
        targetType: "setting",
        details: { key, value },
      });
    } catch (error) {
      console.error("Error updating platform setting:", error);
      throw error;
    }
  }

  // Utility methods
  private static generateTempPassword(): string {
    return (
      Math.random().toString(36).slice(-12) +
      Math.random().toString(36).slice(-12)
    );
  }

  private static getAuthToken(): string {
    // Get auth token from localStorage or session
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    return token || '';
  }

  private static async createAdminSession(adminId: string): Promise<AdminSession> {
    try {
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('admin_sessions')
        .insert({
          admin_id: adminId,
          session_token: sessionToken,
          ip_address: window.location.hostname,
          user_agent: navigator.userAgent,
          is_active: true,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating admin session:", error);
        // Fallback to mock session
        return {
          id: sessionToken,
          adminId,
          sessionToken,
          ipAddress: window.location.hostname,
          userAgent: navigator.userAgent,
          lastActivity: new Date().toISOString(),
          expiresAt: expiresAt.toISOString(),
          isActive: true,
          createdAt: new Date().toISOString(),
        };
      }

      return {
        id: data.id,
        adminId: data.admin_id,
        sessionToken: data.session_token,
        ipAddress: data.ip_address,
        userAgent: data.user_agent,
        lastActivity: data.last_activity,
        expiresAt: data.expires_at,
        isActive: data.is_active,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error("Error creating admin session:", error);
      // Fallback to mock session
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
      
      return {
        id: sessionToken,
        adminId,
        sessionToken,
        ipAddress: window.location.hostname,
        userAgent: navigator.userAgent,
        lastActivity: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
        isActive: true,
        createdAt: new Date().toISOString(),
      };
    }
  }

  private static getRolePermissions(role: AdminRole): string[] {
    const permissions: Record<AdminRole, string[]> = {
      super_admin: [
        "admin.all",
        "users.all",
        "content.all",
        "marketplace.all",
        "crypto.all",
        "freelance.all",
        "settings.all",
        "moderation.all",
      ],
      content_admin: [
        "content.view",
        "content.moderate",
        "content.delete",
        "moderation.assign",
        "moderation.review",
      ],
      user_admin: [
        "users.view",
        "users.edit",
        "users.suspend",
        "users.ban",
        "profiles.edit",
        "permissions.view",
      ],
      marketplace_admin: [
        "marketplace.view",
        "marketplace.moderate",
        "products.all",
        "orders.view",
        "orders.refund",
        "sellers.manage",
      ],
      crypto_admin: [
        "crypto.view",
        "crypto.moderate",
        "trades.view",
        "trades.dispute",
        "wallets.view",
        "transactions.view",
      ],
      freelance_admin: [
        "freelance.view",
        "freelance.moderate",
        "jobs.all",
        "proposals.view",
        "projects.view",
        "disputes.resolve",
        "escrow.manage",
      ],
      support_admin: [
        "support.tickets",
        "users.view",
        "content.view",
        "moderation.view",
        "reports.view",
      ],
    };

    return permissions[role] || [];
  }

  // =============================================================================
  // NEW API METHODS FOR REAL DATA INTEGRATION
  // =============================================================================

  // KYC Management
  static async getKYCVerifications(params: {
    page?: number;
    limit?: number;
    status?: string;
    level?: number;
  } = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.status) queryParams.append('status', params.status);
      if (params.level) queryParams.append('level', params.level.toString());

      const response = await fetch(`/api/admin/kyc/verifications?${queryParams}`, {
        headers: {
          "Authorization": `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching KYC verifications:', error);
      throw error;
    }
  }

  static async updateKYCVerification(id: string, data: {
    status: string;
    level?: number;
    rejectionReason?: string;
  }) {
    try {
      const response = await fetch(`/api/admin/kyc/verifications/${id}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating KYC verification:', error);
      throw error;
    }
  }

  // Financial Management
  static async getFinancialOverview(period: string = '30d') {
    try {
      const response = await fetch(`/api/admin/financial/overview?period=${period}`, {
        headers: {
          "Authorization": `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching financial overview:', error);
      // Fallback to mock data if API fails
      return {
        success: true,
        data: {
          revenue: {
            total: 48500.75,
            change: 12.5,
            trend: 'up',
            dailyAverage: 1616.69
          },
          transactions: {
            total: 2347,
            completed: 2156,
            pending: 124,
            failed: 67,
            volume: 1250000.50
          },
          payouts: {
            pending: 8947.32,
            completed: 45678.90,
            failed: 1250.45
          },
          topPaymentMethods: [
            { method: 'Credit Card', count: 1247, percentage: 53.2 },
            { method: 'PayPal', count: 456, percentage: 19.4 },
            { method: 'Bank Transfer', count: 321, percentage: 13.7 },
            { method: 'Crypto', count: 234, percentage: 10.0 },
            { method: 'Mobile Money', count: 89, percentage: 3.7 }
          ]
        }
      };
    }
  }

  static async getTransactions(params: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  } = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await fetch(`/api/admin/financial/transactions?${queryParams}`, {
        headers: {
          "Authorization": `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Fallback to mock data if API fails
      return {
        success: true,
        data: {
          transactions: [
            {
              id: 'txn_12345',
              userId: 'user_789',
              amount: 2450.00,
              currency: 'USD',
              type: 'credit',
              status: 'completed',
              method: 'Credit Card',
              description: 'Marketplace sale',
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              fees: 73.50
            },
            {
              id: 'txn_12346',
              userId: 'user_456',
              amount: 850.50,
              currency: 'USD',
              type: 'credit',
              status: 'completed',
              method: 'PayPal',
              description: 'Freelance payment',
              createdAt: new Date(Date.now() - 172800000).toISOString(),
              fees: 25.52
            },
            {
              id: 'txn_12347',
              userId: 'user_123',
              amount: 125.75,
              currency: 'USD',
              type: 'debit',
              status: 'pending',
              method: 'Bank Transfer',
              description: 'Payout request',
              createdAt: new Date(Date.now() - 259200000).toISOString(),
              fees: 2.52
            }
          ],
          pagination: {
            page: params.page || 1,
            limit: params.limit || 10,
            total: 3,
            pages: 1
          }
        }
      };
    }
  }

  static async getPayouts(params: {
    page?: number;
    limit?: number;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  } = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await fetch(`/api/admin/financial/payouts?${queryParams}`, {
        headers: {
          "Authorization": `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching payouts:', error);
      // Fallback to mock data if API fails
      return {
        success: true,
        data: {
          payouts: [
            {
              id: 'payout_123',
              userId: 'user_789',
              amount: 2450.00,
              currency: 'USD',
              status: 'completed',
              method: 'Bank Transfer',
              recipient: 'John Doe',
              account: '****4242',
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              processedAt: new Date(Date.now() - 84000000).toISOString(),
              fees: 25.00
            },
            {
              id: 'payout_124',
              userId: 'user_456',
              amount: 850.50,
              currency: 'USD',
              status: 'pending',
              method: 'PayPal',
              recipient: 'Sarah Johnson',
              account: 'sarah@example.com',
              createdAt: new Date(Date.now() - 172800000).toISOString(),
              fees: 12.76
            }
          ],
          pagination: {
            page: params.page || 1,
            limit: params.limit || 10,
            total: 2,
            pages: 1
          }
        }
      };
    }
  }

  static async processPayout(payoutId: string, action: 'approve' | 'reject', notes?: string) {
    try {
      const response = await fetch(`/api/admin/financial/payouts/${payoutId}/${action}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ notes })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing payout:', error);
      throw error;
    }
  }

  static async getPaymentProcessors() {
    try {
      const response = await fetch('/api/admin/financial/payment-processors', {
        headers: {
          "Authorization": `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching payment processors:', error);
      // Fallback to mock data if API fails
      return {
        success: true,
        data: {
          processors: [
            {
              id: 'stripe',
              name: 'Stripe',
              enabled: true,
              apiKeySet: true,
              webhookUrl: 'https://yourdomain.com/api/webhooks/stripe',
              supportedCurrencies: ['USD', 'EUR', 'GBP'],
              fees: {
                percentage: 2.9,
                fixed: 0.30
              }
            },
            {
              id: 'paypal',
              name: 'PayPal',
              enabled: true,
              apiKeySet: true,
              webhookUrl: 'https://yourdomain.com/api/webhooks/paypal',
              supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD'],
              fees: {
                percentage: 3.49,
                fixed: 0.49
              }
            },
            {
              id: 'flutterwave',
              name: 'Flutterwave',
              enabled: false,
              apiKeySet: false,
              webhookUrl: 'https://yourdomain.com/api/webhooks/flutterwave',
              supportedCurrencies: ['NGN', 'KES', 'GHS', 'ZAR'],
              fees: {
                percentage: 1.4,
                fixed: 0
              }
            }
          ]
        }
      };
    }
  }

  static async updatePaymentProcessor(id: string, updates: any) {
    try {
      const response = await fetch(`/api/admin/financial/payment-processors/${id}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating payment processor:', error);
      throw error;
    }
  }

  // Chat Moderation
  static async getFlaggedMessages(params: {
    page?: number;
    limit?: number;
    severity?: string;
  } = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await fetch(`/api/admin/chat/flagged-messages?${queryParams}`, {
        headers: {
          "Authorization": `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching flagged messages:', error);
      throw error;
    }
  }

  static async moderateMessage(id: string, action: string, notes?: string) {
    try {
      const response = await fetch(`/api/admin/chat/messages/${id}/moderate`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ action, notes })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error moderating message:', error);
      throw error;
    }
  }

  // Boost Management
  static async getBoostCampaigns(params: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  } = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await fetch(`/api/admin/boosts/campaigns?${queryParams}`, {
        headers: {
          "Authorization": `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching boost campaigns:', error);
      throw error;
    }
  }

  static async updateBoostCampaign(id: string, status: string, notes?: string) {
    try {
      const response = await fetch(`/api/admin/boosts/campaigns/${id}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ status, notes })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating boost campaign:', error);
      throw error;
    }
  }

  // System Health
  static async getSystemMetrics() {
    try {
      const response = await fetch('/api/admin/system/metrics', {
        headers: {
          "Authorization": `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      throw error;
    }
  }

  // User Management
  static async getUsers(params: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
    verified?: boolean;
  } = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });

      const response = await fetch(`/api/admin/users?${queryParams}`, {
        headers: {
          "Authorization": `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  static async updateUserStatus(id: string, action: string, reason?: string) {
    try {
      const response = await fetch(`/api/admin/users/${id}/status`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ action, reason })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  // Delivery Provider Management
  static async getDeliveryProviders(params: {
    page?: number;
    limit?: number;
    status?: string;
    verificationStatus?: string;
    search?: string;
  } = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });

      const response = await fetch(`/api/admin/delivery/providers?${queryParams}`, {
        headers: {
          "Authorization": `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching delivery providers:', error);
      // Fallback to mock data if API fails
      return {
        success: true,
        data: {
          providers: [
            {
              id: "1",
              businessName: "FastTrack Delivery",
              contactName: "John Smith",
              contactEmail: "john@fasttrack.com",
              contactPhone: "+1-555-0123",
              serviceAreas: [
                { city: "New York", state: "NY", country: "USA", radius: 15 }
              ],
              vehicleTypes: ["bike", "car"],
              servicesOffered: ["same_day", "express", "standard"],
              verificationStatus: "verified",
              rating: 4.8,
              reviewCount: 247,
              completedDeliveries: 1250,
              onTimeRate: 96.5,
              isActive: true,
              isAvailable: true,
              createdAt: "2024-01-10T10:00:00Z",
              lastActiveAt: "2024-01-15T14:30:00Z",
              documents: {
                license: ["license-1.jpg"],
                insurance: ["insurance-1.pdf"],
                registration: ["registration-1.pdf"],
              },
              verifiedAt: "2024-01-12T09:00:00Z",
              verifiedBy: "admin-1",
            },
            {
              id: "2",
              businessName: "QuickDrop Services",
              contactName: "Sarah Johnson",
              contactEmail: "sarah@quickdrop.com",
              contactPhone: "+1-555-0456",
              serviceAreas: [
                { city: "Los Angeles", state: "CA", country: "USA", radius: 20 }
              ],
              vehicleTypes: ["car", "van"],
              servicesOffered: ["next_day", "standard", "scheduled"],
              verificationStatus: "pending",
              rating: 0,
              reviewCount: 0,
              completedDeliveries: 0,
              onTimeRate: 0,
              isActive: false,
              isAvailable: false,
              createdAt: "2024-01-14T15:30:00Z",
              lastActiveAt: "2024-01-14T15:30:00Z",
              documents: {
                license: ["license-2.jpg"],
                insurance: ["insurance-2.pdf"],
              },
            },
            {
              id: "3",
              businessName: "Metro Express",
              contactName: "Mike Wilson",
              contactEmail: "mike@metroexpress.com",
              contactPhone: "+1-555-0789",
              serviceAreas: [
                { city: "Chicago", state: "IL", country: "USA", radius: 25 }
              ],
              vehicleTypes: ["bike", "car", "van"],
              servicesOffered: ["same_day", "express", "standard", "scheduled"],
              verificationStatus: "rejected",
              rating: 0,
              reviewCount: 0,
              completedDeliveries: 0,
              onTimeRate: 0,
              isActive: false,
              isAvailable: false,
              createdAt: "2024-01-08T12:00:00Z",
              lastActiveAt: "2024-01-08T12:00:00Z",
              documents: {
                license: ["license-3.jpg"],
              },
              rejectionReason: "Incomplete documentation - missing insurance certificate",
            },
          ],
          pagination: {
            page: params.page || 1,
            limit: params.limit || 10,
            total: 3,
            pages: 1
          }
        }
      };
    }
  }

  static async getDeliveryProvider(id: string) {
    try {
      const response = await fetch(`/api/admin/delivery/providers/${id}`, {
        headers: {
          "Authorization": `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching delivery provider:', error);
      throw error;
    }
  }

  static async updateDeliveryProviderVerification(id: string, data: {
    status: string;
    notes?: string;
  }) {
    try {
      const response = await fetch(`/api/admin/delivery/providers/${id}/verification`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating delivery provider verification:', error);
      throw error;
    }
  }

  static async updateDeliveryProviderStatus(id: string, isActive: boolean) {
    try {
      const response = await fetch(`/api/admin/delivery/providers/${id}/status`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ isActive })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating delivery provider status:', error);
      throw error;
    }
  }

  static async getDeliveryStats() {
    try {
      const response = await fetch('/api/admin/delivery/stats', {
        headers: {
          "Authorization": `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching delivery stats:', error);
      // Fallback to mock data if API fails
      return {
        success: true,
        data: {
          totalProviders: 15,
          activeProviders: 8,
          pendingVerification: 3,
          totalDeliveries: 2847,
          averageRating: 4.6,
          onTimeRate: 94.2,
        }
      };
    }
  }

  // Delivery Tracking Management Methods
  static async getDeliveryAssignments(params: {
    page?: number;
    limit?: number;
    status?: string;
    providerId?: string;
    search?: string;
  } = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });

      const response = await fetch(`/api/admin/delivery/assignments?${queryParams}`, {
        headers: {
          "Authorization": `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching delivery assignments:', error);
      // Fallback to mock data if API fails
      return {
        success: true,
        data: {
          assignments: [
            {
              id: "1",
              orderId: "order-1",
              orderNumber: "SC240001",
              status: "in_transit",
              trackingNumber: "SC240001ABC",
              pickupAddress: {
                name: "TechStore Inc",
                address: "123 Business St",
                city: "New York",
                state: "NY",
                zipCode: "10001",
                phone: "+1-555-0123",
              },
              deliveryAddress: {
                name: "John Smith",
                address: "456 Residential Ave",
                city: "Brooklyn",
                state: "NY",
                zipCode: "11201",
                phone: "+1-555-0456",
              },
              packageDetails: {
                weight: 2.5,
                dimensions: { length: 30, width: 20, height: 15 },
                value: 299.99,
                description: "Electronics - Smartphone",
                fragile: true,
              },
              deliveryFee: 12.50,
              estimatedDeliveryTime: "2024-01-15T16:00:00Z",
              actualPickupTime: "2024-01-15T14:15:00Z",
              customerNotes: "Please ring doorbell, leave at door if no answer",
              createdAt: "2024-01-15T10:30:00Z",
              providerId: "1",
              providerName: "FastTrack Delivery",
            },
            {
              id: "2",
              orderId: "order-2",
              orderNumber: "SC240002",
              status: "delivered",
              trackingNumber: "SC240002DEF",
              pickupAddress: {
                name: "Fashion Outlet",
                address: "789 Fashion Blvd",
                city: "Los Angeles",
                state: "CA",
                zipCode: "90210",
                phone: "+1-555-0789",
              },
              deliveryAddress: {
                name: "Sarah Johnson",
                address: "321 Style St",
                city: "Santa Monica",
                state: "CA",
                zipCode: "90401",
                phone: "+1-555-0987",
              },
              packageDetails: {
                weight: 1.2,
                dimensions: { length: 25, width: 15, height: 10 },
                value: 89.99,
                description: "Clothing - Designer Jacket",
                fragile: false,
              },
              deliveryFee: 8.75,
              estimatedDeliveryTime: "2024-01-14T18:00:00Z",
              actualPickupTime: "2024-01-14T16:30:00Z",
              actualDeliveryTime: "2024-01-14T17:45:00Z",
              customerNotes: "Leave with concierge",
              createdAt: "2024-01-14T12:00:00Z",
              providerId: "2",
              providerName: "QuickDrop Services",
            },
            {
              id: "3",
              orderId: "order-3",
              orderNumber: "SC240003",
              status: "pending",
              trackingNumber: "SC240003GHI",
              pickupAddress: {
                name: "Bookstore Central",
                address: "456 Literature Ln",
                city: "Chicago",
                state: "IL",
                zipCode: "60601",
                phone: "+1-555-1122",
              },
              deliveryAddress: {
                name: "Mike Wilson",
                address: "789 Knowledge Ave",
                city: "Chicago",
                state: "IL",
                zipCode: "60602",
                phone: "+1-555-3344",
              },
              packageDetails: {
                weight: 0.8,
                dimensions: { length: 20, width: 15, height: 5 },
                value: 24.99,
                description: "Books - Fiction Collection",
                fragile: false,
              },
              deliveryFee: 6.25,
              estimatedDeliveryTime: "2024-01-16T14:00:00Z",
              customerNotes: "Call upon arrival",
              createdAt: "2024-01-15T09:15:00Z",
              providerId: "3",
              providerName: "Metro Express",
            },
          ],
          pagination: {
            page: params.page || 1,
            limit: params.limit || 10,
            total: 3,
            pages: 1
          }
        }
      };
    }
  }

  static async getDeliveryAssignment(id: string) {
    try {
      const response = await fetch(`/api/admin/delivery/assignments/${id}`, {
        headers: {
          "Authorization": `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching delivery assignment:', error);
      throw error;
    }
  }

  static async getDeliveryTrackingStats() {
    try {
      const response = await fetch('/api/admin/delivery/tracking/stats', {
        headers: {
          "Authorization": `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching delivery tracking stats:', error);
      // Fallback to mock data if API fails
      return {
        success: true,
        data: {
          totalDeliveries: 2847,
          activeDeliveries: 12,
          completedToday: 47,
          delayedDeliveries: 3,
          averageDeliveryTime: 32,
          onTimeRate: 94.2,
        }
      };
    }
  }

  static async updateDeliveryAssignmentStatus(id: string, status: string, metadata?: any) {
    try {
      const response = await fetch(`/api/admin/delivery/assignments/${id}/status`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ status, metadata })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating delivery assignment status:', error);
      throw error;
    }
  }

  // =============================================================================
  // FREELANCE MANAGEMENT METHODS
  // =============================================================================

  static async getFreelanceStats(period: string = '30d') {
    try {
      const response = await fetch(`/api/admin/freelance/stats?period=${period}`, {
        headers: {
          "Authorization": `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching freelance stats:', error);
      // Fallback to mock data if API fails
      return {
        success: true,
        data: {
          totalJobs: 1856,
          activeFreelancers: 324,
          totalEarnings: 456789,
          pendingDisputes: 12,
          jobsByCategory: [
            { category: "Web Development", count: 427 },
            { category: "Design", count: 312 },
            { category: "Writing", count: 289 },
            { category: "Mobile Development", count: 198 },
            { category: "Data Science", count: 156 },
          ],
          jobsByStatus: {
            open: 634,
            in_progress: 892,
            completed: 287,
            cancelled: 43,
          },
          topFreelancers: [
            { id: "1", name: "John Developer", earnings: 67890, completedJobs: 45, rating: 4.9 },
            { id: "2", name: "Sarah Designer", earnings: 43210, completedJobs: 32, rating: 4.8 },
            { id: "3", name: "Mike Writer", earnings: 23450, completedJobs: 78, rating: 4.7 },
          ]
        }
      };
    }
  }

  static async getFreelanceJobs(params: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
  } = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });

      const response = await fetch(`/api/admin/freelance/jobs?${queryParams}`, {
        headers: {
          "Authorization": `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching freelance jobs:', error);
      // Fallback to mock data if API fails
      return {
        success: true,
        data: {
          jobs: [
            {
              id: "1",
              title: "React Developer Needed",
              client: "TechCorp",
              freelancer: "john_dev",
              budget: 2500,
              status: "in_progress",
              category: "Development",
              deadline: "2024-02-15",
              postedDate: "2024-01-10",
              applications: 12,
            },
            {
              id: "2",
              title: "Logo Design Project",
              client: "StartupXYZ",
              freelancer: null,
              budget: 500,
              status: "open",
              category: "Design",
              deadline: "2024-02-10",
              postedDate: "2024-01-15",
              applications: 8,
            },
            {
              id: "3",
              title: "Content Writing",
              client: "BlogCorp",
              freelancer: "writer_pro",
              budget: 300,
              status: "completed",
              category: "Writing",
              deadline: "2024-01-30",
              postedDate: "2024-01-05",
              applications: 5,
            },
          ],
          pagination: {
            page: params.page || 1,
            limit: params.limit || 10,
            total: 3,
            pages: 1
          }
        }
      };
    }
  }

  static async getFreelancers(params: {
    page?: number;
    limit?: number;
    status?: string;
    skills?: string[];
    search?: string;
  } = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });

      const response = await fetch(`/api/admin/freelance/freelancers?${queryParams}`, {
        headers: {
          "Authorization": `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching freelancers:', error);
      // Fallback to mock data if API fails
      return {
        success: true,
        data: {
          freelancers: [
            {
              id: "1",
              name: "John Developer",
              username: "john_dev",
              skills: ["React", "Node.js", "TypeScript"],
              rating: 4.9,
              completedJobs: 45,
              earnings: 67890,
              status: "active",
              joinDate: "2023-06-15",
            },
            {
              id: "2",
              name: "Sarah Designer",
              username: "design_sarah",
              skills: ["UI/UX", "Figma", "Photoshop"],
              rating: 4.8,
              completedJobs: 32,
              earnings: 43210,
              status: "active",
              joinDate: "2023-08-22",
            },
            {
              id: "3",
              name: "Mike Writer",
              username: "writer_pro",
              skills: ["Content Writing", "Copywriting", "SEO"],
              rating: 4.7,
              completedJobs: 78,
              earnings: 23450,
              status: "suspended",
              joinDate: "2023-04-10",
            },
          ],
          pagination: {
            page: params.page || 1,
            limit: params.limit || 10,
            total: 3,
            pages: 1
          }
        }
      };
    }
  }

  static async getFreelanceDisputes(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });

      const response = await fetch(`/api/admin/freelance/disputes?${queryParams}`, {
        headers: {
          "Authorization": `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching freelance disputes:', error);
      // Fallback to mock data if API fails
      return {
        success: true,
        data: {
          disputes: [
            {
              id: "1",
              jobTitle: "Website Development",
              client: "ClientA",
              freelancer: "DevB",
              amount: 1500,
              reason: "Quality issues",
              status: "investigating",
              created: "2024-01-25",
            },
            {
              id: "2",
              jobTitle: "Logo Design",
              client: "ClientC",
              freelancer: "DesignerD",
              amount: 300,
              reason: "Late delivery",
              status: "pending",
              created: "2024-01-26",
            },
          ],
          pagination: {
            page: params.page || 1,
            limit: params.limit || 10,
            total: 2,
            pages: 1
          }
        }
      };
    }
  }

  static async updateFreelanceJobStatus(id: string, status: string, notes?: string) {
    try {
      const response = await fetch(`/api/admin/freelance/jobs/${id}/status`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ status, notes })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating freelance job status:', error);
      throw error;
    }
  }

  static async updateFreelancerStatus(id: string, status: string, notes?: string) {
    try {
      const response = await fetch(`/api/admin/freelance/freelancers/${id}/status`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ status, notes })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating freelancer status:', error);
      throw error;
    }
  }

  static async resolveDispute(id: string, resolution: string, notes?: string) {
    try {
      const response = await fetch(`/api/admin/freelance/disputes/${id}/resolve`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ resolution, notes })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error resolving dispute:', error);
      throw error;
    }
  }

}

// Legacy export for backward compatibility
export const getAdminRoles = async (userId: string) => {
  const adminUser = await AdminService.getAdminUser(userId);
  return adminUser?.roles || [];
};