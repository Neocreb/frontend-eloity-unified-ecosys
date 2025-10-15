import { supabase } from "@/integrations/supabase/client";

export interface SMSTemplate {
  id: string;
  name: string;
  content: string;
  variables: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SMSLog {
  id: string;
  provider: string;
  to_number: string;
  message: string;
  status: string;
  provider_response: Record<string, any>;
  sent_at: string;
  delivered_at: string | null;
  user_id: string;
  template_id: string | null;
}

export interface SMSProvider {
  id: string;
  name: string;
  provider_type: string;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface SendSMSData {
  phoneNumber: string;
  message: string;
  type?: 'otp' | 'marketing' | 'transactional' | 'alert' | 'general';
  template?: string;
  variables?: Record<string, any>;
}

export interface SendOTPData {
  phoneNumber: string;
  purpose: string;
  expiryMinutes?: number;
}

export interface VerifyOTPData {
  otpId: string;
  otp: string;
  phoneNumber?: string;
}

export interface BulkSMSData {
  recipients: string[];
  message: string;
  template?: string;
  variables?: Record<string, any>;
  scheduledAt?: string;
}

class SMSService {
  private baseUrl = '/api/notifications';

  // Send single SMS
  async sendSMS(data: SendSMSData): Promise<{
    success: boolean;
    messageId?: string;
    status?: string;
    provider?: string;
    cost?: number;
    estimatedDelivery?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/sms/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: data.phoneNumber,
          message: data.message,
          type: data.type || 'general',
          template: data.template,
          variables: data.variables,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send SMS');
      }

      return {
        success: true,
        messageId: result.messageId,
        status: result.status,
        provider: result.provider,
        cost: result.cost,
        estimatedDelivery: result.estimatedDelivery,
      };
    } catch (error) {
      console.error('SMS send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send SMS',
      };
    }
  }

  // Send OTP via SMS
  async sendOTP(data: SendOTPData): Promise<{
    success: boolean;
    otpId?: string;
    messageId?: string;
    expiresIn?: number;
    maskedPhone?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/sms/otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: data.phoneNumber,
          purpose: data.purpose,
          expiryMinutes: data.expiryMinutes || 10,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send OTP');
      }

      return {
        success: true,
        otpId: result.otpId,
        messageId: result.messageId,
        expiresIn: result.expiresIn,
        maskedPhone: result.maskedPhone,
      };
    } catch (error) {
      console.error('OTP send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send OTP',
      };
    }
  }

  // Verify OTP
  async verifyOTP(data: VerifyOTPData): Promise<{
    success: boolean;
    verified?: boolean;
    message?: string;
    attemptsRemaining?: number;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/sms/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          otpId: data.otpId,
          otp: data.otp,
          phoneNumber: data.phoneNumber,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to verify OTP');
      }

      return {
        success: true,
        verified: result.verified,
        message: result.message,
        attemptsRemaining: result.attemptsRemaining,
      };
    } catch (error) {
      console.error('OTP verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify OTP',
      };
    }
  }

  // Send bulk SMS
  async sendBulkSMS(data: BulkSMSData): Promise<{
    success: boolean;
    campaignId?: string;
    recipientCount?: number;
    estimatedCost?: number;
    status?: string;
    scheduledAt?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/sms/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients: data.recipients,
          message: data.message,
          template: data.template,
          variables: data.variables,
          scheduledAt: data.scheduledAt,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send bulk SMS');
      }

      return {
        success: true,
        campaignId: result.campaignId,
        recipientCount: result.recipientCount,
        estimatedCost: result.estimatedCost,
        status: result.status,
        scheduledAt: result.scheduledAt,
      };
    } catch (error) {
      console.error('Bulk SMS send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send bulk SMS',
      };
    }
  }

  // Get SMS templates
  async getSMSTemplates(): Promise<SMSTemplate[]> {
    try {
      const response = await fetch(`${this.baseUrl}/templates?type=sms`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch SMS templates');
      }
      
      const result = await response.json();
      return result.templates || [];
    } catch (error) {
      console.error('SMS templates fetch error:', error);
      return [];
    }
  }

  // Get SMS logs
  async getSMSLogs(filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    logs: SMSLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const response = await fetch(`${this.baseUrl}/history?type=sms&${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch SMS logs');
      }
      
      const result = await response.json();
      return {
        logs: result.notifications || [],
        pagination: result.pagination,
      };
    } catch (error) {
      console.error('SMS logs fetch error:', error);
      return {
        logs: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          pages: 0,
        },
      };
    }
  }

  // Get SMS providers
  async getSMSProviders(): Promise<SMSProvider[]> {
    try {
      const { data, error } = await supabase
        .from('sms_providers')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('SMS providers fetch error:', error);
      return [];
    }
  }

  // Phone number lookup and validation
  async lookupPhoneNumber(phoneNumber: string): Promise<{
    isValid: boolean;
    country?: string;
    carrier?: string;
    lineType?: string;
    canReceiveSMS: boolean;
    canReceiveVoice: boolean;
    timezone?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/phone/lookup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to lookup phone number');
      }

      return {
        isValid: result.isValid,
        country: result.country,
        carrier: result.carrier,
        lineType: result.lineType,
        canReceiveSMS: result.canReceiveSMS,
        canReceiveVoice: result.canReceiveVoice,
        timezone: result.timezone,
      };
    } catch (error) {
      console.error('Phone lookup error:', error);
      return {
        isValid: false,
        canReceiveSMS: false,
        canReceiveVoice: false,
        error: error instanceof Error ? error.message : 'Failed to lookup phone number',
      };
    }
  }
}

export const smsService = new SMSService();
export default smsService;