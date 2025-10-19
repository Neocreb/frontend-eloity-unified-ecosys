import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

console.log("🚀 Supabase Edge Function: bybit started");

// Helper: HMAC-SHA256 and hex encode using Web Crypto
async function hmacSha256Hex(secret, message) {
  const enc = new TextEncoder();
  const keyData = enc.encode(secret);
  const algo = { name: "HMAC", hash: "SHA-256" };
  const key = await crypto.subtle.importKey("raw", keyData, algo, false, ["sign"]);
  const sig = await crypto.subtle.sign(algo.name, key, enc.encode(message));
  const bytes = new Uint8Array(sig);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

// Minimal Bybit request signer following common pattern (timestamp + method + path + body)
async function signBybit(secret, timestamp, method, path, bodyString) {
  const payload = `${timestamp}${method.toUpperCase()}${path}${bodyString || ''}`;
  return await hmacSha256Hex(secret, payload);
}

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, '');
    const action = path.split('/').pop(); // last segment

    const BYBIT_KEY = Deno.env.get('BYBIT_PUBLIC_API') || '';
    const BYBIT_SECRET = Deno.env.get('BYBIT_SECRET_API') || '';

    if (!BYBIT_KEY || !BYBIT_SECRET) {
      return new Response(JSON.stringify({ error: 'Bybit credentials not configured in edge function env' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // Map actions to Bybit endpoints (v5 unified APIs where applicable)
    const bybitBase = 'https://api.bybit.com';

    // Use query param or body depending on method
    const method = req.method;
    const body = method !== 'GET' ? await req.text() : '';

    let targetPath = '/v5/account/wallet-balance';
    let query = '';

    switch (action) {
      case 'balances':
        // optional ccy query param
        const ccy = url.searchParams.get('ccy');
        query = ccy ? `?ccy=${encodeURIComponent(ccy)}` : '';
        targetPath = `/v5/account/wallet-balance${query}`;
        break;
      case 'positions':
        const symbol = url.searchParams.get('symbol');
        query = symbol ? `?symbol=${encodeURIComponent(symbol)}` : '';
        targetPath = `/v5/position/list${query}`;
        break;
      case 'orders':
        // orders list
        const s = url.searchParams.get('symbol');
        query = s ? `?symbol=${encodeURIComponent(s)}` : '';
        targetPath = `/v5/order/list${query}`;
        break;
      case 'place-order':
        targetPath = `/v5/order/create`;
        break;
      case 'order-history':
        targetPath = `/v5/exchange-trade/closed-pnl/list`;
        break;
      case 'transfer':
        targetPath = `/v5/asset/transfer`;
        break;
      case 'convert':
        targetPath = `/v5/asset/convert`;
        break;
      default:
        return new Response(JSON.stringify({ error: 'Unsupported action' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    const timestamp = Date.now().toString();
    const signature = await signBybit(BYBIT_SECRET, timestamp, method, targetPath, body);

    const headers = {
      'Content-Type': 'application/json',
      'X-BAPI-API-KEY': BYBIT_KEY,
      'X-BAPI-SIGN': signature,
      'X-BAPI-TIMESTAMP': timestamp,
      'X-BAPI-RECV-WINDOW': '5000'
    };

    const resp = await fetch(`${bybitBase}${targetPath}`, {
      method,
      headers,
      body: body || undefined,
    });

    const text = await resp.text();
    const outHeaders = { 'Content-Type': 'application/json' };
    return new Response(text, { status: resp.status, headers: outHeaders });
  } catch (err) {
    console.error('Bybit edge function error:', err);
    return new Response(JSON.stringify({ error: 'Internal error', details: err?.message || String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
