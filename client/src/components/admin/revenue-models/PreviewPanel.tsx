import { useTranslation } from "react-i18next";

interface PreviewPanelProps {
  modelVersionId?: number;
  /** For draft preview (if backend adds previewDraft later) */
  rules?: Record<string, unknown>;
  streamType?: string;
}

export function PreviewPanel({ modelVersionId }: PreviewPanelProps) {
  const { t } = useTranslation();
  if (!modelVersionId) {
    return (
      <p className="text-muted-foreground text-sm">
        {t("admin.revenueModels.preview.afterCreate")}
      </p>
    );
  }
  return (
    <p className="text-muted-foreground text-sm">
      {t("admin.revenueModels.preview.useList")}
    </p>
  );
}
