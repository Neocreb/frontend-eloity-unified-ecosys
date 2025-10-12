import { giftCardService } from "@/services/giftCardService";

describe("giftCardService", () => {
  it("purchases a gift card and returns a code", async () => {
    const rec = await giftCardService.purchase({ retailerId: "amazon", amount: 25 });
    expect(rec.id).toMatch(/gc_/);
    expect(rec.code).toMatch(/^[A-Z0-9-]{19}$/);
    expect(rec.retailerName).toBe("Amazon");
  });

  it("submits a sell request and computes payout", async () => {
    const rec = await giftCardService.submitSell({ retailerId: "amazon", faceValue: 100, code: "ABCDEFGH1234" });
    expect(rec.payout).toBeGreaterThan(0);
    expect(rec.direction).toBe("sell");
  });
});
