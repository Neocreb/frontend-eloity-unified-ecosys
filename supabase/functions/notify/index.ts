// @ts-nocheck - Supabase Edge Functions use Deno runtime, not Node.js
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

console.log('Supabase Edge Function: notify started');

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    const body = await req.json();
    const { channel, to, subject, text, html, from } = body || {};

    if (!channel || !to || (!text && !html && !subject)) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Twilio SMS
    const TWILIO_SID = Deno.env.get('TWILIO_SID_KEY') || Deno.env.get('TWILIO_SID') || '';
    const TWILIO_TOKEN = Deno.env.get('TWILIO_API_SECRET_KEY') || Deno.env.get('TWILIO_AUTH_TOKEN') || '';

    // Resend email
    const RESEND_API = Deno.env.get('RESEND_API') || '';

    if (channel === 'sms') {
      if (!TWILIO_SID || !TWILIO_TOKEN) {
        return new Response(JSON.stringify({ error: 'Twilio not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }

      const fromNumber = from || Deno.env.get('TWILIO_FROM') || '';
      const params = new URLSearchParams();
      params.append('To', to);
      params.append('From', fromNumber);
      params.append('Body', text || html || subject || '');

      const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      const data = await resp.text();
      return new Response(data, { status: resp.status, headers: { 'Content-Type': 'application/json' } });
    }

    if (channel === 'email') {
      if (!RESEND_API) {
        return new Response(JSON.stringify({ error: 'Resend not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }

      const fromEmail = from || Deno.env.get('RESEND_FROM') || 'no-reply@eloity.com';
      const payload = {
        from: fromEmail,
        to: Array.isArray(to) ? to : [to],
        subject: subject || '',
        html: html || `<div>${text || subject}</div>`
      };

      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await resp.text();
      return new Response(data, { status: resp.status, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Unsupported channel' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Notify edge function error:', err);
    return new Response(JSON.stringify({ error: 'Internal error', details: err?.message || String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
