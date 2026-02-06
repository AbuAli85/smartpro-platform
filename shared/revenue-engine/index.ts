/**
 * Revenue Models v1 — deterministic rules engine.
 * Pure functions: no DB, no side effects. Used by server for preview (and optionally client).
 * Oman compliance: government fees are passThroughOMR and excluded from platform revenue totals.
 */

import type {
  ComputeRevenueInput,
  ComputeRevenueOutput,
  RevenueRules,
  SubscriptionRules,
  SubscriptionScenario,
  MarketplaceRules,
  MarketplaceScenario,
  SanadRules,
  SanadScenario,
  ProRules,
  ProScenario,
} from "../revenue-models";

export function computeRevenue(input: ComputeRevenueInput): ComputeRevenueOutput {
  const { rules, scenario, currency = "OMR" } = input;
  const warnings: string[] = [];
  const breakdown: ComputeRevenueOutput["breakdown"] = [];

  let platformRevenueOMR = 0;
  let passThroughOMR = 0;

  if (rules.streamType !== scenario.streamType) {
    warnings.push(`Rules stream type (${rules.streamType}) does not match scenario (${scenario.streamType}).`);
  }

  const passThrough = "passThroughOMR" in rules ? (rules as { passThroughOMR?: number }).passThroughOMR ?? 0 : 0;
  const scenarioPassThrough = "passThroughOMR" in scenario ? (scenario as { passThroughOMR?: number }).passThroughOMR ?? 0 : 0;
  const totalPassThrough = passThrough + scenarioPassThrough;
  passThroughOMR = totalPassThrough;
  if (totalPassThrough > 0) {
    breakdown.push({ label: "Government / pass-through fees", amountOMR: totalPassThrough, isPassThrough: true });
  }

  switch (rules.streamType) {
    case "subscription": {
      const subRules = rules as SubscriptionRules;
      const subScenario = scenario as SubscriptionScenario;
      const subs = subScenario.subscribers ?? 0;
      const basePrice = subScenario.basePriceOMR ?? subRules.basePriceOMR ?? 0;
      const period = subScenario.period ?? subRules.period ?? "monthly";
      const months = period === "annual" ? 12 : 1;
      let revenue = subs * basePrice * months;

      if (subRules.seats && subScenario.seats) {
        const seatRevenue = subScenario.seats * subRules.seats.pricePerSeatOMR * months;
        revenue += seatRevenue;
        breakdown.push({ label: "Seats", amountOMR: seatRevenue, isPassThrough: false });
      }

      if (subRules.discounts && subRules.discounts.length > 0 && subs > 0) {
        const applicable = subRules.discounts.find(d => (d.minSeats ?? 0) <= subs);
        if (applicable) {
          const discount = revenue * (applicable.pctOff / 100);
          revenue -= discount;
          breakdown.push({ label: "Discount", amountOMR: -discount, isPassThrough: false });
        }
      }

      breakdown.push({ label: "Subscription revenue", amountOMR: revenue, isPassThrough: false });
      platformRevenueOMR += revenue;
      break;
    }

    case "marketplace": {
      const mktRules = rules as MarketplaceRules;
      const mktScenario = scenario as MarketplaceScenario;
      const gmv = mktScenario.gmvOMR ?? 0;
      let commissionPct = mktScenario.commissionPct ?? mktRules.commissionPct ?? 0;

      if (mktRules.tiered && mktRules.tiered.length > 0) {
        const bracket = mktRules.tiered.find(
          t => gmv >= t.minOMR && (t.maxOMR === 0 || gmv <= t.maxOMR)
        );
        if (bracket) commissionPct = bracket.pct;
        else warnings.push("GMV falls outside defined tier brackets; using default commission.");
      }

      const commission = gmv * (commissionPct / 100);
      breakdown.push({ label: "Commission", amountOMR: commission, isPassThrough: false });
      platformRevenueOMR += commission;
      break;
    }

    case "sanad": {
      const sanadRules = rules as SanadRules;
      const sanadScenario = scenario as SanadScenario;
      let totalFees = 0;
      let sanadPassThrough = 0;
      for (const txn of sanadScenario.txns ?? []) {
        const feeOMR = txn.feeOMR ?? sanadRules.fixedFeeByTxnType?.[txn.type] ?? 0;
        const line = txn.count * feeOMR;
        totalFees += line;
        if (txn.passThroughOMR) sanadPassThrough += txn.count * txn.passThroughOMR;
      }
      passThroughOMR += sanadPassThrough;
      if (sanadRules.tiered && sanadRules.tiered.length > 0) {
        const totalTxns = (sanadScenario.txns ?? []).reduce((s, t) => s + t.count, 0);
        const tier = sanadRules.tiered.find(
          t => totalTxns >= t.minTxn && (t.maxTxn === 0 || totalTxns <= t.maxTxn)
        );
        if (tier) totalFees = totalTxns * tier.feeOMR;
      }
      breakdown.push({ label: "Sanad fees", amountOMR: totalFees, isPassThrough: false });
      platformRevenueOMR += totalFees;
      break;
    }

    case "pro": {
      const proRules = rules as ProRules;
      const proScenario = scenario as ProScenario;
      let total = 0;
      if (proRules.pricingMode === "fixed" || proScenario.fixedFeeOMR != null) {
        const fee = proScenario.fixedFeeOMR ?? proRules.fixedFeeOMR ?? 0;
        total += fee;
        breakdown.push({ label: "Fixed fee", amountOMR: fee, isPassThrough: false });
      }
      if ((proRules.pricingMode === "hourly" || proScenario.hours != null) && (proScenario.hours ?? 0) > 0) {
        const rate = proScenario.hourlyRateOMR ?? proRules.hourlyRateOMR ?? 0;
        const line = (proScenario.hours ?? 0) * rate;
        total += line;
        breakdown.push({ label: "Hourly", amountOMR: line, isPassThrough: false });
      }
      const addOns = proScenario.addOns ?? proRules.addOns ?? [];
      for (const a of addOns) {
        total += a.amountOMR;
        breakdown.push({ label: `Add-on: ${a.name}`, amountOMR: a.amountOMR, isPassThrough: false });
      }
      platformRevenueOMR += total;
      break;
    }

    default: {
      const r = rules as { streamType?: string };
      warnings.push(`Unknown stream type: ${r.streamType ?? "unknown"}`);
    }
  }

  const grossOMR = platformRevenueOMR + passThroughOMR;

  return {
    totals: {
      platformRevenueOMR,
      passThroughOMR,
      grossOMR,
    },
    breakdown,
    warnings,
  };
}
