/**
 * Revenue Models v1 — shared types for stream types, rules, scenario input, and engine output.
 * Single source of truth for tRPC input/output and rules engine.
 * All types are serializable (no Date objects in payloads; use ISO strings if needed).
 */

export type RevenueStreamType = "subscription" | "marketplace" | "sanad" | "pro";

export type RevenueModelStatus = "draft" | "active" | "archived";

// ---------------------------------------------------------------------------
// Rules per stream (stored in revenue_model_versions.rulesJson)
// ---------------------------------------------------------------------------

export interface SubscriptionRules {
  streamType: "subscription";
  basePriceOMR: number;
  period: "monthly" | "annual";
  seats?: { pricePerSeatOMR: number };
  discounts?: Array<{ minSeats?: number; pctOff: number }>;
  passThroughOMR?: number; // gov fees, excluded from platform revenue
}

export interface MarketplaceRules {
  streamType: "marketplace";
  commissionPct: number;
  tiered?: Array<{ minOMR: number; maxOMR: number; pct: number }>;
  passThroughOMR?: number;
}

export interface SanadRules {
  streamType: "sanad";
  fixedFeeByTxnType: Record<string, number>; // txn type -> fee OMR
  tiered?: Array<{ minTxn: number; maxTxn: number; feeOMR: number }>;
  passThroughOMR?: number;
}

export interface ProRules {
  streamType: "pro";
  pricingMode: "fixed" | "hourly";
  fixedFeeOMR?: number;
  hourlyRateOMR?: number;
  addOns?: Array<{ name: string; amountOMR: number }>;
  passThroughOMR?: number;
}

export type RevenueRules =
  | SubscriptionRules
  | MarketplaceRules
  | SanadRules
  | ProRules;

// ---------------------------------------------------------------------------
// Scenario input (per stream) — what the admin enters for preview
// ---------------------------------------------------------------------------

export interface SubscriptionScenario {
  streamType: "subscription";
  subscribers: number;
  basePriceOMR?: number;
  period?: "monthly" | "annual";
  seats?: number;
  passThroughOMR?: number;
}

export interface MarketplaceScenario {
  streamType: "marketplace";
  gmvOMR: number;
  commissionPct?: number;
  passThroughOMR?: number;
}

export interface SanadScenario {
  streamType: "sanad";
  txns: Array<{ type: string; count: number; feeOMR?: number; passThroughOMR?: number }>;
  passThroughOMR?: number;
}

export interface ProScenario {
  streamType: "pro";
  hours?: number;
  hourlyRateOMR?: number;
  fixedFeeOMR?: number;
  addOns?: Array<{ name: string; amountOMR: number }>;
  passThroughOMR?: number;
}

export type ScenarioInput =
  | SubscriptionScenario
  | MarketplaceScenario
  | SanadScenario
  | ProScenario;

// ---------------------------------------------------------------------------
// Engine input / output
// ---------------------------------------------------------------------------

export interface ComputeRevenueInput {
  rules: RevenueRules;
  scenario: ScenarioInput;
  currency?: string; // default "OMR"
}

export interface BreakdownEntry {
  label: string;
  amountOMR: number;
  isPassThrough?: boolean;
}

export interface ComputeRevenueOutput {
  totals: {
    platformRevenueOMR: number;
    passThroughOMR: number;
    grossOMR: number;
  };
  breakdown: BreakdownEntry[];
  warnings: string[];
}

// ---------------------------------------------------------------------------
// Type guards (optional runtime checks)
// ---------------------------------------------------------------------------

export function isSubscriptionRules(r: RevenueRules): r is SubscriptionRules {
  return r.streamType === "subscription";
}

export function isMarketplaceRules(r: RevenueRules): r is MarketplaceRules {
  return r.streamType === "marketplace";
}

export function isSanadRules(r: RevenueRules): r is SanadRules {
  return r.streamType === "sanad";
}

export function isProRules(r: RevenueRules): r is ProRules {
  return r.streamType === "pro";
}
