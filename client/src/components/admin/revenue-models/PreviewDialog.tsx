import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { RevenueStreamType, ScenarioInput } from "@shared/revenue-models";
import { Eye } from "lucide-react";

interface PreviewDialogProps {
  modelId: number;
  modelVersionId: number;
  streamType: RevenueStreamType;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PreviewDialog({
  modelId,
  modelVersionId,
  streamType,
  isOpen,
  onOpenChange,
}: PreviewDialogProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Scenario state per stream type
  const [subscriptionSubscribers, setSubscriptionSubscribers] = useState("");
  const [subscriptionSeats, setSubscriptionSeats] = useState("");
  const [subscriptionPeriod, setSubscriptionPeriod] = useState<"monthly" | "annual">("monthly");
  const [subscriptionPassThrough, setSubscriptionPassThrough] = useState("");

  const [marketplaceGmv, setMarketplaceGmv] = useState("");
  const [marketplacePassThrough, setMarketplacePassThrough] = useState("");

  const [sanadTxns, setSanadTxns] = useState<Array<{ type: string; count: string; feeOMR: string; passThroughOMR: string }>>([
    { type: "", count: "", feeOMR: "", passThroughOMR: "" },
  ]);
  const [sanadPassThrough, setSanadPassThrough] = useState("");

  const [proHours, setProHours] = useState("");
  const [proHourlyRate, setProHourlyRate] = useState("");
  const [proFixedFee, setProFixedFee] = useState("");
  const [proPassThrough, setProPassThrough] = useState("");

  const buildScenarioInput = (): ScenarioInput | null => {
    switch (streamType) {
      case "subscription": {
        const subscribers = parseInt(subscriptionSubscribers, 10);
        if (isNaN(subscribers) || subscribers < 1) {
          toast.error(t("admin.revenueModels.preview.validation.subscribersRequired"));
          return null;
        }
        const scenario: ScenarioInput = {
          streamType: "subscription",
          subscribers,
          period: subscriptionPeriod,
        };
        if (subscriptionSeats) {
          const seats = parseInt(subscriptionSeats, 10);
          if (!isNaN(seats) && seats > 0) scenario.seats = seats;
        }
        if (subscriptionPassThrough) {
          const pt = parseFloat(subscriptionPassThrough);
          if (!isNaN(pt) && pt >= 0) scenario.passThroughOMR = pt;
        }
        return scenario;
      }
      case "marketplace": {
        const gmv = parseFloat(marketplaceGmv);
        if (isNaN(gmv) || gmv < 0) {
          toast.error(t("admin.revenueModels.preview.validation.gmvRequired"));
          return null;
        }
        const scenario: ScenarioInput = {
          streamType: "marketplace",
          gmvOMR: gmv,
        };
        if (marketplacePassThrough) {
          const pt = parseFloat(marketplacePassThrough);
          if (!isNaN(pt) && pt >= 0) scenario.passThroughOMR = pt;
        }
        return scenario;
      }
      case "sanad": {
        const validTxns = sanadTxns
          .filter((t) => t.type.trim() && t.count.trim())
          .map((t) => {
            const count = parseInt(t.count, 10);
            if (isNaN(count) || count < 1) return null;
            const txn: { type: string; count: number; feeOMR?: number; passThroughOMR?: number } = {
              type: t.type.trim(),
              count,
            };
            if (t.feeOMR) {
              const fee = parseFloat(t.feeOMR);
              if (!isNaN(fee) && fee >= 0) txn.feeOMR = fee;
            }
            if (t.passThroughOMR) {
              const pt = parseFloat(t.passThroughOMR);
              if (!isNaN(pt) && pt >= 0) txn.passThroughOMR = pt;
            }
            return txn;
          })
          .filter((t): t is NonNullable<typeof t> => t !== null);
        if (validTxns.length === 0) {
          toast.error(t("admin.revenueModels.preview.validation.sanadTxnsRequired"));
          return null;
        }
        const scenario: ScenarioInput = {
          streamType: "sanad",
          txns: validTxns,
        };
        if (sanadPassThrough) {
          const pt = parseFloat(sanadPassThrough);
          if (!isNaN(pt) && pt >= 0) scenario.passThroughOMR = pt;
        }
        return scenario;
      }
      case "pro": {
        const scenario: ScenarioInput = { streamType: "pro" };
        if (proHours) {
          const hours = parseFloat(proHours);
          if (!isNaN(hours) && hours > 0) scenario.hours = hours;
        }
        if (proHourlyRate) {
          const rate = parseFloat(proHourlyRate);
          if (!isNaN(rate) && rate >= 0) scenario.hourlyRateOMR = rate;
        }
        if (proFixedFee) {
          const fee = parseFloat(proFixedFee);
          if (!isNaN(fee) && fee >= 0) scenario.fixedFeeOMR = fee;
        }
        if (proPassThrough) {
          const pt = parseFloat(proPassThrough);
          if (!isNaN(pt) && pt >= 0) scenario.passThroughOMR = pt;
        }
        if (!scenario.hours && !scenario.fixedFeeOMR) {
          toast.error(t("admin.revenueModels.preview.validation.proHoursOrFixedRequired"));
          return null;
        }
        return scenario;
      }
      default:
        return null;
    }
  };

  // Store last valid scenario for query key (required even when enabled: false)
  const [lastScenario, setLastScenario] = useState<ScenarioInput | null>(null);

  const { data, isLoading, refetch, isFetching } = trpc.revenueModels.preview.useQuery(
    {
      modelVersionId,
      scenarioInput: lastScenario || ({ streamType } as ScenarioInput), // Fallback for initial render
    },
    {
      enabled: false, // Only fetch on manual trigger via refetch()
    }
  );

  const handlePreview = async () => {
    const scenario = buildScenarioInput();
    if (!scenario) return;
    setLastScenario(scenario);
    try {
      await refetch();
    } catch (err) {
      // Error handled by tRPC
    }
  };

  const formatOMR = (amount: number) => {
    return new Intl.NumberFormat(i18n.language === "ar" ? "ar-OM" : "en-US", {
      style: "currency",
      currency: "OMR",
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir={isRTL ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle>{t("admin.revenueModels.preview.title")}</DialogTitle>
          <DialogDescription>{t("admin.revenueModels.preview.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Scenario Input Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t("admin.revenueModels.preview.scenarioInput")}</h3>

            {streamType === "subscription" && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>{t("admin.revenueModels.preview.fields.subscribers")}</Label>
                  <Input
                    type="number"
                    min="1"
                    value={subscriptionSubscribers}
                    onChange={(e) => setSubscriptionSubscribers(e.target.value)}
                    placeholder="100"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t("admin.revenueModels.preview.fields.seats")}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={subscriptionSeats}
                    onChange={(e) => setSubscriptionSeats(e.target.value)}
                    placeholder={t("admin.revenueModels.preview.fields.seatsOptional")}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t("admin.revenueModels.preview.fields.period")}</Label>
                  <Select value={subscriptionPeriod} onValueChange={(v) => setSubscriptionPeriod(v as "monthly" | "annual")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">{t("admin.revenueModels.preview.fields.periodMonthly")}</SelectItem>
                      <SelectItem value="annual">{t("admin.revenueModels.preview.fields.periodAnnual")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>{t("admin.revenueModels.preview.fields.passThroughOMR")}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.001"
                    value={subscriptionPassThrough}
                    onChange={(e) => setSubscriptionPassThrough(e.target.value)}
                    placeholder={t("admin.revenueModels.preview.fields.passThroughOptional")}
                  />
                </div>
              </div>
            )}

            {streamType === "marketplace" && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>{t("admin.revenueModels.preview.fields.gmvOMR")}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.001"
                    value={marketplaceGmv}
                    onChange={(e) => setMarketplaceGmv(e.target.value)}
                    placeholder="10000.000"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t("admin.revenueModels.preview.fields.passThroughOMR")}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.001"
                    value={marketplacePassThrough}
                    onChange={(e) => setMarketplacePassThrough(e.target.value)}
                    placeholder={t("admin.revenueModels.preview.fields.passThroughOptional")}
                  />
                </div>
              </div>
            )}

            {streamType === "sanad" && (
              <div className="space-y-4">
                {sanadTxns.map((txn, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-2 p-3 border rounded-md">
                    <div className="grid gap-1">
                      <Label className="text-xs">{t("admin.revenueModels.preview.fields.txnType")}</Label>
                      <Input
                        value={txn.type}
                        onChange={(e) => {
                          const updated = [...sanadTxns];
                          updated[idx] = { ...updated[idx], type: e.target.value };
                          setSanadTxns(updated);
                        }}
                        placeholder="e.g., registration"
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label className="text-xs">{t("admin.revenueModels.preview.fields.txnCount")}</Label>
                      <Input
                        type="number"
                        min="1"
                        value={txn.count}
                        onChange={(e) => {
                          const updated = [...sanadTxns];
                          updated[idx] = { ...updated[idx], count: e.target.value };
                          setSanadTxns(updated);
                        }}
                        placeholder="10"
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label className="text-xs">{t("admin.revenueModels.preview.fields.feeOMR")}</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.001"
                        value={txn.feeOMR}
                        onChange={(e) => {
                          const updated = [...sanadTxns];
                          updated[idx] = { ...updated[idx], feeOMR: e.target.value };
                          setSanadTxns(updated);
                        }}
                        placeholder="0.000"
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label className="text-xs">{t("admin.revenueModels.preview.fields.passThroughOMR")}</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.001"
                        value={txn.passThroughOMR}
                        onChange={(e) => {
                          const updated = [...sanadTxns];
                          updated[idx] = { ...updated[idx], passThroughOMR: e.target.value };
                          setSanadTxns(updated);
                        }}
                        placeholder="0.000"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSanadTxns([...sanadTxns, { type: "", count: "", feeOMR: "", passThroughOMR: "" }])}
                >
                  {t("admin.revenueModels.preview.fields.addTxn")}
                </Button>
                <div className="grid gap-2">
                  <Label>{t("admin.revenueModels.preview.fields.passThroughOMR")}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.001"
                    value={sanadPassThrough}
                    onChange={(e) => setSanadPassThrough(e.target.value)}
                    placeholder={t("admin.revenueModels.preview.fields.passThroughOptional")}
                  />
                </div>
              </div>
            )}

            {streamType === "pro" && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>{t("admin.revenueModels.preview.fields.hours")}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={proHours}
                    onChange={(e) => setProHours(e.target.value)}
                    placeholder={t("admin.revenueModels.preview.fields.hoursOptional")}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t("admin.revenueModels.preview.fields.hourlyRateOMR")}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.001"
                    value={proHourlyRate}
                    onChange={(e) => setProHourlyRate(e.target.value)}
                    placeholder="50.000"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t("admin.revenueModels.preview.fields.fixedFeeOMR")}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.001"
                    value={proFixedFee}
                    onChange={(e) => setProFixedFee(e.target.value)}
                    placeholder={t("admin.revenueModels.preview.fields.fixedFeeOptional")}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t("admin.revenueModels.preview.fields.passThroughOMR")}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.001"
                    value={proPassThrough}
                    onChange={(e) => setProPassThrough(e.target.value)}
                    placeholder={t("admin.revenueModels.preview.fields.passThroughOptional")}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          {data && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold">{t("admin.revenueModels.preview.results")}</h3>

              {data.warnings.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    {t("admin.revenueModels.preview.warnings")}
                  </p>
                  <ul className="list-disc list-inside mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                    {data.warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t("admin.revenueModels.preview.totals.platformRevenue")}</p>
                  <p className="text-lg font-semibold">{formatOMR(data.totals.platformRevenueOMR)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t("admin.revenueModels.preview.totals.passThrough")}</p>
                  <p className="text-lg font-semibold">{formatOMR(data.totals.passThroughOMR)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t("admin.revenueModels.preview.totals.gross")}</p>
                  <p className="text-lg font-semibold">{formatOMR(data.totals.grossOMR)}</p>
                </div>
              </div>

              {data.breakdown.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium">{t("admin.revenueModels.preview.breakdown")}</p>
                  <div className="space-y-1">
                    {data.breakdown.map((entry, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className={entry.isPassThrough ? "text-muted-foreground" : ""}>{entry.label}</span>
                        <span className={entry.isPassThrough ? "text-muted-foreground" : "font-medium"}>
                          {formatOMR(entry.amountOMR)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.close")}
          </Button>
          <Button onClick={handlePreview} disabled={isFetching || isLoading}>
            <Eye className="h-4 w-4 mr-2" />
            {isFetching || isLoading ? t("common.loading") : t("admin.revenueModels.preview.calculate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
