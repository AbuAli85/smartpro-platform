import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, Plus, Eye } from "lucide-react";
import { ExportButton } from "@/components/admin/revenue-models/ExportButton";
import { PreviewDialog } from "@/components/admin/revenue-models/PreviewDialog";
import type { RevenueStreamType, RevenueModelStatus } from "@shared/revenue-models";

const STREAM_OPTIONS: { value: RevenueStreamType | "all"; labelKey: string }[] = [
  { value: "all", labelKey: "admin.revenueModels.filters.allStreamTypes" },
  { value: "subscription", labelKey: "admin.revenueModels.streamTypes.subscription" },
  { value: "marketplace", labelKey: "admin.revenueModels.streamTypes.marketplace" },
  { value: "sanad", labelKey: "admin.revenueModels.streamTypes.sanad" },
  { value: "pro", labelKey: "admin.revenueModels.streamTypes.pro" },
];

const STATUS_OPTIONS: { value: RevenueModelStatus | "all"; labelKey: string }[] = [
  { value: "all", labelKey: "admin.revenueModels.filters.allStatuses" },
  { value: "draft", labelKey: "admin.revenueModels.statuses.draft" },
  { value: "active", labelKey: "admin.revenueModels.statuses.active" },
  { value: "archived", labelKey: "admin.revenueModels.statuses.archived" },
];

export default function RevenueModelsPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [streamFilter, setStreamFilter] = useState<RevenueStreamType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<RevenueModelStatus | "all">("all");
  const [previewModelId, setPreviewModelId] = useState<number | null>(null);
  const [previewModelVersionId, setPreviewModelVersionId] = useState<number | null>(null);
  const [previewStreamType, setPreviewStreamType] = useState<RevenueStreamType | null>(null);

  const { data, isLoading, error } = trpc.revenueModels.listModels.useQuery({
    streamType: streamFilter === "all" ? undefined : streamFilter,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const models = data?.models ?? [];
  const versionsByModel = data?.versionsByModel ?? {};

  const getLatestVersion = (modelId: number) => {
    const versions = versionsByModel[modelId];
    if (!versions?.length) return null;
    return versions.reduce((a, b) => (a.version > b.version ? a : b));
  };

  const getName = (modelId: number) => {
    const v = getLatestVersion(modelId);
    if (!v) return "—";
    return isRTL ? v.nameAr : v.nameEn;
  };

  const getEffectiveFrom = (modelId: number) => {
    const v = getLatestVersion(modelId);
    const date = v?.effectiveFrom;
    return date && date.trim() ? date : "—";
  };

  return (
    <div className="container mx-auto py-8 space-y-8" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">{t("admin.revenueModels.title")}</h1>
            <p className="text-muted-foreground">{t("admin.revenueModels.subtitle")}</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/admin/revenue-models/new">
            <Plus className="h-4 w-4 mr-2" />
            {t("admin.revenueModels.new")}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-4">
          <CardTitle>{t("admin.revenueModels.filters.title")}</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Select
              value={streamFilter}
              onValueChange={(v) => setStreamFilter(v as RevenueStreamType | "all")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("admin.revenueModels.filters.streamType")} />
              </SelectTrigger>
              <SelectContent>
                {STREAM_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {t(o.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as RevenueModelStatus | "all")}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder={t("admin.revenueModels.filters.status")} />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {t(o.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-destructive text-sm mb-4">{error.message}</p>
          )}
          {isLoading ? (
            <p className="text-muted-foreground">{t("common.loading")}</p>
          ) : models.length === 0 ? (
            <p className="text-muted-foreground">{t("admin.revenueModels.noModels")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.revenueModels.fields.nameEn")}</TableHead>
                  <TableHead>{t("admin.revenueModels.fields.streamType")}</TableHead>
                  <TableHead>{t("admin.revenueModels.fields.status")}</TableHead>
                  <TableHead>{t("admin.revenueModels.fields.effectiveFrom")}</TableHead>
                  <TableHead className="text-right">{t("admin.revenueModels.actions.title")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell className="font-medium">{getName(model.id)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{t(`admin.revenueModels.streamTypes.${model.streamType}`)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={model.status === "active" ? "default" : model.status === "draft" ? "secondary" : "outline"}>
                        {t(`admin.revenueModels.statuses.${model.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getEffectiveFrom(model.id)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {getLatestVersion(model.id) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const latest = getLatestVersion(model.id);
                              if (latest) {
                                setPreviewModelId(model.id);
                                setPreviewModelVersionId(latest.id);
                                setPreviewStreamType(model.streamType);
                              }
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {t("admin.revenueModels.preview.button")}
                          </Button>
                        )}
                        <ExportButton modelId={model.id} variant="ghost" size="sm" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {previewModelId !== null && previewModelVersionId !== null && previewStreamType !== null && (
        <PreviewDialog
          modelId={previewModelId}
          modelVersionId={previewModelVersionId}
          streamType={previewStreamType}
          isOpen={true}
          onOpenChange={(open) => {
            if (!open) {
              setPreviewModelId(null);
              setPreviewModelVersionId(null);
              setPreviewStreamType(null);
            }
          }}
        />
      )}
    </div>
  );
}
