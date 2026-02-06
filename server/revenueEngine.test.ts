import { describe, it, expect } from "vitest";
import { computeRevenue } from "../shared/revenue-engine";
import type {
  SubscriptionRules,
  SubscriptionScenario,
  MarketplaceRules,
  MarketplaceScenario,
  SanadRules,
  SanadScenario,
  ProRules,
  ProScenario,
} from "../shared/revenue-models";

describe("revenue engine", () => {
  it("subscription base only", () => {
    const rules: SubscriptionRules = {
      streamType: "subscription",
      basePriceOMR: 10,
      period: "monthly",
    };
    const scenario: SubscriptionScenario = {
      streamType: "subscription",
      subscribers: 200,
    };
    const out = computeRevenue({ rules, scenario });
    expect(out.totals.platformRevenueOMR).toBe(200 * 10); // 2000
    expect(out.totals.passThroughOMR).toBe(0);
    expect(out.totals.grossOMR).toBe(2000);
    expect(out.warnings).toHaveLength(0);
  });

  it("marketplace commission %", () => {
    const rules: MarketplaceRules = {
      streamType: "marketplace",
      commissionPct: 5,
    };
    const scenario: MarketplaceScenario = {
      streamType: "marketplace",
      gmvOMR: 10_000,
    };
    const out = computeRevenue({ rules, scenario });
    expect(out.totals.platformRevenueOMR).toBe(500);
    expect(out.totals.grossOMR).toBe(500);
  });

  it("sanad fixed fee by txn type", () => {
    const rules: SanadRules = {
      streamType: "sanad",
      fixedFeeByTxnType: { registration: 50, renewal: 20 },
    };
    const scenario: SanadScenario = {
      streamType: "sanad",
      txns: [
        { type: "registration", count: 10 },
        { type: "renewal", count: 5 },
      ],
    };
    const out = computeRevenue({ rules, scenario });
    expect(out.totals.platformRevenueOMR).toBe(10 * 50 + 5 * 20); // 600
  });

  it("PRO hourly with add-on", () => {
    const rules: ProRules = {
      streamType: "pro",
      pricingMode: "hourly",
      hourlyRateOMR: 25,
      addOns: [{ name: "Rush", amountOMR: 15 }],
    };
    const scenario: ProScenario = {
      streamType: "pro",
      hours: 4,
      addOns: [{ name: "Rush", amountOMR: 15 }],
    };
    const out = computeRevenue({ rules, scenario });
    expect(out.totals.platformRevenueOMR).toBe(4 * 25 + 15); // 115
  });

  it("pass-through excluded from platform totals", () => {
    const rules: MarketplaceRules = {
      streamType: "marketplace",
      commissionPct: 3,
      passThroughOMR: 100,
    };
    const scenario: MarketplaceScenario = {
      streamType: "marketplace",
      gmvOMR: 5000,
      passThroughOMR: 50,
    };
    const out = computeRevenue({ rules, scenario });
    expect(out.totals.platformRevenueOMR).toBe(150); // 3% of 5000
    expect(out.totals.passThroughOMR).toBe(150); // 100 + 50
    expect(out.totals.grossOMR).toBe(300);
    const passThroughEntry = out.breakdown.find((b) => b.isPassThrough);
    expect(passThroughEntry).toBeDefined();
    expect(passThroughEntry!.amountOMR).toBe(150);
  });

  it("tier bracket selection for marketplace", () => {
    const rules: MarketplaceRules = {
      streamType: "marketplace",
      commissionPct: 2,
      tiered: [
        { minOMR: 0, maxOMR: 5000, pct: 3 },
        { minOMR: 5001, maxOMR: 20000, pct: 2.5 },
        { minOMR: 20001, maxOMR: 0, pct: 2 }, // 0 = no max
      ],
    };
    const scenario: MarketplaceScenario = { streamType: "marketplace", gmvOMR: 25000 };
    const out = computeRevenue({ rules, scenario });
    // 25k falls in third bracket (2%)
    expect(out.totals.platformRevenueOMR).toBe(25000 * 0.02); // 500
  });
});
