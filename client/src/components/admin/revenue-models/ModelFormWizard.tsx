import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { RuleBuilder } from "./RuleBuilder";
import type { RevenueStreamType } from "@shared/revenue-models";

const STREAM_TYPES: RevenueStreamType[] = ["subscription", "marketplace", "sanad", "pro"];

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

interface ModelFormWizardProps {
  onSuccess: () => void;
}

export function ModelFormWizard({ onSuccess }: ModelFormWizardProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [streamType, setStreamType] = useState<RevenueStreamType>("subscription");
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [rulesJson, setRulesJson] = useState<Record<string, unknown>>({ streamType });

  const createModel = trpc.revenueModels.createModel.useMutation({
    onSuccess: () => {
      toast.success(t("admin.revenueModels.createSuccess"));
      onSuccess();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const validateStep1 = () => {
    if (!nameEn.trim()) {
      toast.error(t("admin.revenueModels.validation.nameEnRequired"));
      return false;
    }
    if (!nameAr.trim()) {
      toast.error(t("admin.revenueModels.validation.nameArRequired"));
      return false;
    }
    if (!DATE_REGEX.test(effectiveFrom)) {
      toast.error(t("admin.revenueModels.validation.effectiveFromFormat"));
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    if (!validateStep1()) return;
    createModel.mutate({
      streamType,
      currency: "OMR",
      nameEn: nameEn.trim(),
      nameAr: nameAr.trim(),
      effectiveFrom,
      rulesJson: { ...rulesJson, streamType },
    });
  };

  return (
    <div className="space-y-6">
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>{t("admin.revenueModels.fields.streamType")}</Label>
            <Select value={streamType} onValueChange={(v) => setStreamType(v as RevenueStreamType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STREAM_TYPES.map((st) => (
                  <SelectItem key={st} value={st}>
                    {t(`admin.revenueModels.streamTypes.${st}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>{t("admin.revenueModels.fields.nameEn")}</Label>
            <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="Revenue model name (EN)" />
          </div>
          <div className="grid gap-2">
            <Label>{t("admin.revenueModels.fields.nameAr")}</Label>
            <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder="اسم نموذج الإيرادات" />
          </div>
          <div className="grid gap-2">
            <Label>{t("admin.revenueModels.fields.effectiveFrom")}</Label>
            <Input
              type="date"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              placeholder="YYYY-MM-DD"
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <RuleBuilder
          streamType={streamType}
          value={rulesJson}
          onChange={setRulesJson}
        />
      )}

      {step === 3 && (
        <div className="text-muted-foreground">
          {t("admin.revenueModels.wizard.reviewHint")}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={handleBack} disabled={step === 1}>
          {t("common.back")}
        </Button>
        {step < 3 ? (
          <Button type="button" onClick={handleNext}>
            {t("common.next")}
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={createModel.isPending}>
            {createModel.isPending ? t("common.loading") : t("admin.revenueModels.actions.create")}
          </Button>
        )}
      </div>
    </div>
  );
}
