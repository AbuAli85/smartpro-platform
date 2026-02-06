import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RevenueStreamType } from "@shared/revenue-models";

interface RuleBuilderProps {
  streamType: RevenueStreamType;
  value: Record<string, unknown>;
  onChange: (rules: Record<string, unknown>) => void;
}

export function RuleBuilder({ streamType, value, onChange }: RuleBuilderProps) {
  const { t } = useTranslation();

  const update = (key: string, val: unknown) => {
    onChange({ ...value, [key]: val });
  };

  switch (streamType) {
    case "subscription":
      return (
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>{t("admin.revenueModels.rules.basePriceOMR")}</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={(value.basePriceOMR as number) ?? ""}
              onChange={(e) => update("basePriceOMR", e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          <div className="grid gap-2">
            <Label>{t("admin.revenueModels.rules.period")}</Label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              value={(value.period as string) ?? "monthly"}
              onChange={(e) => update("period", e.target.value)}
            >
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
        </div>
      );
    case "marketplace":
      return (
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>{t("admin.revenueModels.rules.commissionPct")}</Label>
            <Input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={(value.commissionPct as number) ?? ""}
              onChange={(e) => update("commissionPct", e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
        </div>
      );
    case "sanad":
      return (
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">{t("admin.revenueModels.rules.sanadHint")}</p>
        </div>
      );
    case "pro":
      return (
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>{t("admin.revenueModels.rules.fixedFeeOMR")}</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={(value.fixedFeeOMR as number) ?? ""}
              onChange={(e) => update("fixedFeeOMR", e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
        </div>
      );
    default:
      return null;
  }
}
