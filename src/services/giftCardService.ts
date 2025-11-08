import { findRetailer } from "@/config/giftCards";
import analyticsService from "@/services/analyticsService";

export type GiftCardStatus = "active" | "redeemed" | "pending" | "submitted";

export interface GiftCardRecord {
  id: string;
  retailerId: string;
  retailerName: string;
  amount: number;
  code: string;
  pin?: string;
  direction: "buy" | "sell";
  payout?: number; // for sells
  status: GiftCardStatus;
  createdAt: string;
  recipientEmail?: string;
}

const STORAGE_KEY = "wallet_gift_cards";

const load = (): GiftCardRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GiftCardRecord[]) : [];
  } catch {
    return [];
  }
};

const save = (list: GiftCardRecord[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
};

const genCode = (len = 16) =>
  Array.from({ length: len }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(Math.floor(Math.random() * 36)))
    .join("")
    .replace(/(.{4})/g, "$1-")
    .slice(0, 19);

export const giftCardService = {
  async purchase(params: { retailerId: string; amount: number; recipientEmail?: string; }): Promise<GiftCardRecord> {
    const retailer = findRetailer(params.retailerId);
    if (!retailer) throw new Error("Unknown retailer");

    await new Promise(r=>setTimeout(r, 400));
    const record: GiftCardRecord = {
      id: `gc_${Date.now()}`,
      retailerId: retailer.id,
      retailerName: retailer.name,
      amount: params.amount,
      code: genCode(),
      direction: "buy",
      status: "active",
      createdAt: new Date().toISOString(),
      recipientEmail: params.recipientEmail,
    };
    const list = load();
    list.unshift(record);
    save(list);
    analyticsService.track("giftcard_purchase", { retailer: retailer.id, amount: params.amount });
    return record;
  },

  async submitSell(params: { retailerId: string; faceValue: number; code: string; pin?: string; }): Promise<GiftCardRecord> {
    const retailer = findRetailer(params.retailerId);
    if (!retailer) throw new Error("Unknown retailer");

    await new Promise(r=>setTimeout(r, 400));
    const payout = Math.round(params.faceValue * retailer.sellRate * 100) / 100;
    const record: GiftCardRecord = {
      id: `gc_${Date.now()}`,
      retailerId: retailer.id,
      retailerName: retailer.name,
      amount: params.faceValue,
      code: params.code,
      pin: params.pin,
      direction: "sell",
      payout,
      status: "submitted",
      createdAt: new Date().toISOString(),
    };
    const list = load();
    list.unshift(record);
    save(list);
    analyticsService.track("giftcard_sell_submitted", { retailer: retailer.id, faceValue: params.faceValue, payout });
    return record;
  },

  async list(limit = 50): Promise<GiftCardRecord[]> {
    const list = load();
    return list.slice(0, limit);
  },
};

export function updateGiftCardStatus(id: string, status: GiftCardStatus): GiftCardRecord | null {
  const list = load();
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  const updated: GiftCardRecord = { ...list[idx], status };
  list[idx] = updated;
  save(list);
  return updated;
}

export function deleteGiftCardRecord(id: string): boolean {
  const list = load();
  const next = list.filter((r) => r.id !== id);
  if (next.length === list.length) return false;
  save(next);
  return true;
}
