import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import type { ButtonProps } from "@/components/ui/button";

interface ExportButtonProps extends ButtonProps {
  modelId: number;
}

export function ExportButton({ modelId, children, ...props }: ExportButtonProps) {
  const { t } = useTranslation();
  const { refetch, isFetching } = trpc.revenueModels.exportModel.useQuery(
    { modelId },
    { enabled: false }
  );

  const handleExport = async () => {
    try {
      const { data } = await refetch();
      if (!data) {
        toast.error(t("admin.revenueModels.exportError"));
        return;
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `revenue-model-${modelId}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t("admin.revenueModels.exportSuccess"));
    } catch (e) {
      toast.error(t("admin.revenueModels.exportError"));
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleExport}
      disabled={isFetching}
      {...props}
    >
      <Download className="h-4 w-4 mr-1" />
      {children ?? t("admin.revenueModels.actions.export")}
    </Button>
  );
}
