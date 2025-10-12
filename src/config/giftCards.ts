export interface GiftCardRetailer {
  id: string;
  name: string;
  buyFeePercent: number; // fee applied on buy (e.g., 2%)
  sellRate: number; // payout factor for selling (e.g., 0.9)
}

export const GIFT_CARD_RETAILERS: GiftCardRetailer[] = [
  { id: "amazon", name: "Amazon", buyFeePercent: 2, sellRate: 0.92 },
  { id: "itunes", name: "Apple iTunes", buyFeePercent: 2, sellRate: 0.88 },
  { id: "play", name: "Google Play", buyFeePercent: 2, sellRate: 0.9 },
  { id: "steam", name: "Steam", buyFeePercent: 2, sellRate: 0.85 },
  { id: "netflix", name: "Netflix", buyFeePercent: 2, sellRate: 0.86 },
  { id: "uber", name: "Uber", buyFeePercent: 2, sellRate: 0.87 },
  { id: "walmart", name: "Walmart", buyFeePercent: 2, sellRate: 0.87 },
  { id: "target", name: "Target", buyFeePercent: 2, sellRate: 0.86 },
  { id: "jumia", name: "Jumia", buyFeePercent: 2, sellRate: 0.8 },
  { id: "konga", name: "Konga", buyFeePercent: 2, sellRate: 0.8 },
];

export const findRetailer = (id: string) => GIFT_CARD_RETAILERS.find(r=>r.id===id);
