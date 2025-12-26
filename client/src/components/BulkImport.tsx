import { useState, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, Download, Loader2, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

interface BulkImportProps {
  type: "offices" | "templates";
  data: any[];
}

export default function BulkImport({ type, data }: BulkImportProps) {
  const { t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importOfficeMutation = trpc.bulkTranslation.importOfficeTranslations.useMutation();
  const importTemplateMutation = trpc.bulkTranslation.importTemplateTranslations.useMutation();

  const handleDownloadTemplate = () => {
    // Create template data based on type
    const templateData = data.slice(0, 5).map((item) => ({
      id: item.id,
      name: type === "offices" ? item.officeName : item.templateName,
      nameAr: type === "offices" ? item.officeNameAr || "" : item.templateNameAr || "",
      descriptionAr: item.descriptionAr || "",
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, type === "offices" ? "Offices" : "Templates");

    // Download file
    XLSX.writeFile(wb, `${type}_translations_template.xlsx`);
    toast.success(t("admin.downloadTemplate"));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    try {
      // Read file
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Validate and transform data
          const translations = jsonData.map((row: any) => ({
            id: Number(row.id),
            nameAr: row.nameAr || "",
            descriptionAr: row.descriptionAr || "",
          }));

          // Import translations
          const mutation = type === "offices" ? importOfficeMutation : importTemplateMutation;
          const result = await mutation.mutateAsync({ translations });

          if (result.success > 0) {
            toast.success(
              t("admin.importSuccess").replace("{count}", result.success.toString())
            );
          }

          if (result.failed > 0) {
            toast.error(`${result.failed} translations failed to import`);
            console.error("Import errors:", result.errors);
          }

          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } catch (error) {
          console.error("Error processing file:", error);
          toast.error(t("admin.importError"));
        } finally {
          setIsProcessing(false);
        }
      };

      reader.readAsBinaryString(file);
    } catch (error) {
      console.error("Error reading file:", error);
      toast.error(t("admin.importError"));
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          {t("admin.bulkImport")}
        </CardTitle>
        <CardDescription>{t("admin.bulkImportDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Download Template Button */}
          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            {t("admin.downloadTemplate")}
          </Button>

          {/* Upload File Button */}
          <Button
            variant="default"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("admin.processing")}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {t("admin.uploadFile")}
              </>
            )}
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <p>{t("admin.fileFormat")}</p>
          <p>{t("admin.templateColumns")}</p>
        </div>
      </CardContent>
    </Card>
  );
}
