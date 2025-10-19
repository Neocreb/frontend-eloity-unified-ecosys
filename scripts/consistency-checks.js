#!/usr/bin/env node
import fetch from 'node-fetch';
import { db } from '../server/enhanced-index.js';
import {
  orders,
  freelance_payments,
  user_rewards,
  referral_events,
} from '../shared/enhanced-schema.js';
import { crypto_wallets } from '../shared/crypto-schema.js';
import { sum, eq } from 'drizzle-orm';

const PORT = process.env.PORT || 5002;
const BASE = process.env.BASE_URL || `http://localhost:${PORT}`;
const userId = process.argv[2] || process.env.USER_ID;

if (!userId) {
  console.error('Usage: node scripts/consistency-checks.js <userId>');
  process.exit(1);
}

async function fetchWalletBalance() {
  try {
    const res = await fetch(`${BASE}/api/wallet/balance?userId=${userId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch /api/wallet/balance, will try DB direct queries:', err.message || err);
    return null;
  }
}

async function computeDbTotals() {
  try {
    // crypto
    let cryptoTotal = 0;
    try {
      const rows = await db.select({ total: sum(crypto_wallets.balance) }).from(crypto_wallets).where(eq(crypto_wallets.user_id, userId)).execute();
      cryptoTotal = parseFloat(rows[0]?.total?.toString() || '0');
    } catch (e) {
      console.warn('DB crypto query failed:', e.message || e);
    }

    // marketplace orders
    let marketplaceTotal = 0;
    try {
      const rows = await db.select({ total: sum(orders.total_amount) }).from(orders).where(eq(orders.seller_id, userId)).execute();
      marketplaceTotal = parseFloat(rows[0]?.total?.toString() || '0');
    } catch (e) {
      console.warn('DB orders query failed:', e.message || e);
    }

    // freelance payments
    let freelanceTotal = 0;
    try {
      const rows = await db.select({ total: sum(freelance_payments.amount) }).from(freelance_payments).where(eq(freelance_payments.payee_id, userId)).execute();
      freelanceTotal = parseFloat(rows[0]?.total?.toString() || '0');
    } catch (e) {
      console.warn('DB freelance payments query failed:', e.message || e);
    }

    // rewards
    let rewardsTotal = 0;
    try {
      const rows = await db.select({ total: sum(user_rewards.amount) }).from(user_rewards).where(eq(user_rewards.user_id, userId)).execute();
      rewardsTotal = parseFloat(rows[0]?.total?.toString() || '0');
    } catch (e) {
      console.warn('DB rewards query failed:', e.message || e);
    }

    // referrals
    let referralTotal = 0;
    try {
      const rows = await db.select({ total: sum(referral_events.reward_amount) }).from(referral_events).where(eq(referral_events.referrer_id, userId)).execute();
      referralTotal = parseFloat(rows[0]?.total?.toString() || '0');
    } catch (e) {
      console.warn('DB referral query failed:', e.message || e);
    }

    const total = cryptoTotal + marketplaceTotal + freelanceTotal + rewardsTotal + referralTotal;
    return { cryptoTotal, marketplaceTotal, freelanceTotal, rewardsTotal, referralTotal, total };
  } catch (error) {
    console.error('computeDbTotals error:', error);
    return null;
  }
}

(async function main() {
  console.log('Running consistency checks for user:', userId);

  const apiData = await fetchWalletBalance();
  const dbTotals = await computeDbTotals();

  console.log('\nDB totals:');
  console.table(dbTotals);

  if (apiData && apiData.data && apiData.data.balances) {
    console.log('\nAPI balances:');
    console.table(apiData.data.balances);

    // Compare
    const diffs = {};
    diffs.crypto = (dbTotals.cryptoTotal || 0) - (apiData.data.balances.crypto || 0);
    diffs.marketplace = (dbTotals.marketplaceTotal || 0) - (apiData.data.balances.marketplace || 0);
    diffs.freelance = (dbTotals.freelanceTotal || 0) - (apiData.data.balances.freelance || 0);
    diffs.rewards = (dbTotals.rewardsTotal || 0) - (apiData.data.balances.rewards || 0);
    diffs.referral = (dbTotals.referralTotal || 0) - (apiData.data.balances.referral || 0);
    diffs.total = (dbTotals.total || 0) - (apiData.data.balances.total || 0);

    console.log('\nDifferences (DB - API):');
    console.table(diffs);
  } else {
    console.warn('API balances not available; only DB totals shown. Start server and retry to compare API vs DB.');
  }

  console.log('\nConsistency check complete');
})();
