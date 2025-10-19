import { logger } from '../utils/logger.js';

const SUPABASE_EDGE_BASE = process.env.SUPABASE_EDGE_BASE || process.env.SUPABASE_FUNCTIONS_URL || '';

export async function sendNotification(payload: { channel: 'sms'|'email'|'push'|'whatsapp'|'voice'|'ussd', to: string | string[], subject?: string, text?: string, html?: string, from?: string }) {
  try {
    if (!SUPABASE_EDGE_BASE) throw new Error('Edge functions base URL not configured');

    const url = `${SUPABASE_EDGE_BASE.replace(/\/+/g, '')}/notify`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await resp.text();
    try {
      return { ok: resp.ok, status: resp.status, data: JSON.parse(text) };
    } catch (e) {
      return { ok: resp.ok, status: resp.status, data: text };
    }
  } catch (error) {
    logger.error('Failed to send notification via edge function:', error);
    return { ok: false, error: error.message };
  }
}

// Convenience wrappers used by server routes
export async function sendSMSNotification(data: { userId?: string; phoneNumber: string; message?: string; template?: string; variables?: any; type?: string }) {
  try {
    const text = data.message || (data.template ? `${data.template} ${JSON.stringify(data.variables || {})}` : '');
    const res = await sendNotification({ channel: 'sms', to: data.phoneNumber, text });
    return { success: !!res.ok, messageId: res?.data?.messageId || `sms_${Date.now()}`, provider: res?.data?.provider || 'edge', status: res.status, cost: res?.data?.cost || 0, estimatedDelivery: res?.data?.eta };
  } catch (error) {
    logger.error('sendSMSNotification error:', error);
    return { success: false, error: (error as any).message };
  }
}

export async function sendEmailNotification(data: { userId?: string; to: string | string[]; subject?: string; text?: string; html?: string }) {
  try {
    const res = await sendNotification({ channel: 'email', to: data.to, subject: data.subject, text: data.text, html: data.html });
    return { success: !!res.ok, messageId: res?.data?.messageId || `email_${Date.now()}`, provider: res?.data?.provider || 'edge', status: res.status };
  } catch (error) {
    logger.error('sendEmailNotification error:', error);
    return { success: false, error: (error as any).message };
  }
}

export async function sendPushNotification(data: { userIds: string[]; title: string; body: string; metadata?: any }) {
  try {
    const res = await sendNotification({ channel: 'push', to: data.userIds as any, text: data.body });
    return { success: !!res.ok, status: res.status };
  } catch (error) {
    logger.error('sendPushNotification error:', error);
    return { success: false, error: (error as any).message };
  }
}

export async function sendWhatsAppMessage(data: { to: string; message: string }) {
  try {
    const res = await sendNotification({ channel: 'whatsapp', to: data.to, text: data.message });
    return { success: !!res.ok, status: res.status };
  } catch (error) {
    logger.error('sendWhatsAppMessage error:', error);
    return { success: false, error: (error as any).message };
  }
}

export async function createBulkNotification(bulkData: { adminId?: string; recipients: string[]; message?: string; template?: string; variables?: any; scheduledAt?: Date }) {
  try {
    // Schedule or immediately send via edge function; here we forward to edge notify endpoint for batch sends
    const to = bulkData.recipients;
    const text = bulkData.message || (bulkData.template ? `${bulkData.template} ${JSON.stringify(bulkData.variables || {})}` : '');
    const res = await sendNotification({ channel: 'sms', to: to as any, text });
    return {
      success: !!res.ok,
      campaignId: `bulk_${Date.now()}`,
      estimatedCost: (bulkData.recipients?.length || 0) * 0.01,
      status: res.ok ? 'sent' : 'failed',
      scheduledAt: bulkData.scheduledAt || new Date()
    };
  } catch (error) {
    logger.error('createBulkNotification error:', error);
    return { success: false, error: (error as any).message };
  }
}

export async function getNotificationHistory(userId: string, limit = 50) {
  try {
    // Best-effort: call edge function history or return empty array if unavailable
    if (!SUPABASE_EDGE_BASE) return [];
    const url = `${SUPABASE_EDGE_BASE.replace(/\/+/g, '')}/notify/history?userId=${encodeURIComponent(userId)}&limit=${limit}`;
    const r = await fetch(url);
    if (!r.ok) return [];
    const j = await r.json();
    return j?.items || [];
  } catch (error) {
    logger.warn('getNotificationHistory fallback empty:', error);
    return [];
  }
}

export async function updateNotificationPreferences(userId: string, prefs: any) {
  try {
    // Forward to edge or persist in DB in a real implementation
    return { success: true };
  } catch (error) {
    logger.error('updateNotificationPreferences error:', error);
    return { success: false, error: (error as any).message };
  }
}

export async function getNotificationTemplates() {
  try {
    return [];
  } catch (error) {
    return [];
  }
}

export async function trackNotificationDelivery(event: any) {
  try {
    // noop for now
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as any).message };
  }
}

export async function sendVoiceCall(data: { to: string; message: string }) {
  try {
    const res = await sendNotification({ channel: 'voice', to: data.to, text: data.message });
    return { success: !!res.ok };
  } catch (error) {
    return { success: false, error: (error as any).message };
  }
}

export async function sendUSSDMenu(data: { to: string; menu: string }) {
  try {
    const res = await sendNotification({ channel: 'ussd', to: data.to, text: data.menu });
    return { success: !!res.ok };
  } catch (error) {
    return { success: false, error: (error as any).message };
  }
}

export async function phoneNumberLookup(number: string) {
  try {
    // Optionally call external lookup service via edge
    if (!SUPABASE_EDGE_BASE) return null;
    const url = `${SUPABASE_EDGE_BASE.replace(/\/+/g, '')}/notify/lookup?number=${encodeURIComponent(number)}`;
    const r = await fetch(url);
    if (!r.ok) return null;
    return await r.json();
  } catch (error) {
    logger.warn('phoneNumberLookup error:', error);
    return null;
  }
}

// Simple OTP helpers used by routes
export async function sendOTPSMS(phoneNumber: string, purpose: string, expiryMinutes = 10) {
  try {
    const otpId = `otp_${Date.now()}`;
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const message = `Your ${purpose} code is ${otpCode}. It expires in ${expiryMinutes} minutes.`;
    const sms = await sendSMSNotification({ phoneNumber, message });
    return { success: !!sms.success, otpId, messageId: sms.messageId, expiresIn: expiryMinutes * 60 };
  } catch (error) {
    logger.error('sendOTPSMS error:', error);
    return { success: false, error: (error as any).message };
  }
}

export async function verifyOTP(otpId: string, otp: string, phoneNumber?: string) {
  try {
    // Development mode: accept any OTP; in production validate stored OTP
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as any).message };
  }
}
