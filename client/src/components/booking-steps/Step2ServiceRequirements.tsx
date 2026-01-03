import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, X, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import { useState } from "react";
import { getServiceConfig, type ServiceRequirement } from "@/../../shared/serviceRequirements";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";

interface Step2Props {
  serviceName: string;
  formData: Record<string, any>;
  onFormDataChange: (data: Record<string, any>) => void;
}

export function Step2ServiceRequirements({
  serviceName,
  formData,
  onFormDataChange,
}: Step2Props) {
  const { t } = useLanguage();
  const config = getServiceConfig(serviceName);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (fieldId: string, value: any) => {
    onFormDataChange({
      ...formData,
      [fieldId]: value,
    });
  };

  const handleFileUpload = (fieldId: string, file: File | null) => {
    if (!file) {
      const newFiles = { ...uploadedFiles };
      delete newFiles[fieldId];
      setUploadedFiles(newFiles);
      handleFieldChange(fieldId, null);
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadErrors({
        ...uploadErrors,
        [fieldId]: "File size must be less than 5MB",
      });
      return;
    }

    // Validate file type
    const field = config.formFields.find((f) => f.id === fieldId);
    if (field?.fileTypes && !field.fileTypes.includes(file.type)) {
      setUploadErrors({
        ...uploadErrors,
        [fieldId]: `Invalid file type. Accepted: ${field.fileTypes.join(", ")}`,
      });
      return;
    }

    // Clear error and store file
    const newErrors = { ...uploadErrors };
    delete newErrors[fieldId];
    setUploadErrors(newErrors);

    setUploadedFiles({
      ...uploadedFiles,
      [fieldId]: file,
    });

    handleFieldChange(fieldId, file);
  };

  const renderField = (field: ServiceRequirement) => {
    const value = formData[field.id] || "";
    const hasError = uploadErrors[field.id];
    const uploadedFile = uploadedFiles[field.id];

    switch (field.type) {
      case "text":
        return (
          <Textarea
            id={field.id}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="min-h-[100px]"
            required={field.required}
          />
        );

      case "number":
        return (
          <Input
            id={field.id}
            type="number"
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
          />
        );

      case "date":
        return (
          <Input
            id={field.id}
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
          />
        );

      case "select":
        return (
          <Select
            value={value}
            onValueChange={(val) => handleFieldChange(field.id, val)}
            required={field.required}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "file":
        return (
          <div className="space-y-2">
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                hasError && "border-destructive bg-destructive/5",
                uploadedFile && "border-primary bg-primary/5"
              )}
            >
              {uploadedFile ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <CheckCircle2 className="w-5 h-5" />
                    <FileText className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium">{uploadedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(uploadedFile.size / 1024).toFixed(2)} KB
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFileUpload(field.id, null)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-center">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <label
                      htmlFor={field.id}
                      className="cursor-pointer text-sm font-medium text-primary hover:underline"
                    >
                      Click to upload
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {field.fileTypes?.includes("application/pdf")
                        ? "PDF, JPG, or PNG"
                        : "JPG or PNG"}{" "}
                      (max 5MB)
                    </p>
                  </div>
                  <input
                    id={field.id}
                    type="file"
                    accept={field.fileTypes?.join(",")}
                    onChange={(e) =>
                      handleFileUpload(field.id, e.target.files?.[0] || null)
                    }
                    className="hidden"
                    required={field.required}
                  />
                </div>
              )}
            </div>
            {hasError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span>{hasError}</span>
              </div>
            )}
          </div>
        );

      default:
        return (
          <Input
            id={field.id}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
          />
        );
    }
  };

  // Calculate completion percentage
  const totalFields = config.formFields.length;
  const completedFields = config.formFields.filter(
    (field) => formData[field.id] && formData[field.id] !== ""
  ).length;
  const completionPercentage = Math.round((completedFields / totalFields) * 100);

  // Check which documents are actually uploaded
  const getUploadedDocumentNames = () => {
    return Object.values(uploadedFiles).map(file => file.name.toLowerCase());
  };

  const uploadedDocNames = getUploadedDocumentNames();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{t("booking.serviceRequirements")}</h2>
        <p className="text-muted-foreground">
          {t("booking.provideRequiredInfo")}{" "}
          <strong>{serviceName}</strong>
        </p>
      </div>

      {/* Progress Indicator */}
      <Card className="p-4 bg-muted/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{t("booking.formCompletion")}</span>
          <span className="text-sm font-semibold text-primary">
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${completionPercentage}%` }}
            role="progressbar"
            aria-valuenow={completionPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {completedFields} {t("booking.of")} {totalFields} {t("booking.fieldsCompleted")}
        </p>
      </Card>

      {/* Document Checklist */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          {t("booking.requiredDocumentsChecklist")}
        </h3>
        <ul className="space-y-2">
          {config.requiredDocuments.map((doc, index) => {
            // Check if this document type is uploaded by matching document name patterns
            const docLower = doc.toLowerCase();
            const isUploaded = uploadedDocNames.some(uploadedName => 
              uploadedName.includes(docLower) || docLower.includes(uploadedName.split('.')[0])
            ) || Object.keys(uploadedFiles).some(key => {
              const field = config.formFields.find(f => f.id === key && f.type === 'file');
              return field && field.label.toLowerCase().includes(docLower);
            });
            
            return (
              <li key={index} className="flex items-start gap-2 text-sm">
                {isUploaded ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground mt-0.5 flex-shrink-0" />
                )}
                <span className={isUploaded ? "text-foreground" : "text-muted-foreground"}>
                  {doc}
                </span>
              </li>
            );
          })}
        </ul>
      </Card>

      {/* Dynamic Form Fields */}
      <div className="space-y-6">
        {config.formFields.map((field) => (
          <div key={field.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor={field.id}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {field.helpText && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>{field.helpText}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {renderField(field)}
          </div>
        ))}
      </div>

      {/* Additional Notes */}
      <div className="space-y-2">
        <Label htmlFor="additionalNotes">
          {t("booking.additionalNotes")}
        </Label>
        <Textarea
          id="additionalNotes"
          placeholder={t("booking.additionalNotesPlaceholder")}
          value={formData.additionalNotes || ""}
          onChange={(e) => handleFieldChange("additionalNotes", e.target.value)}
          className="min-h-[80px]"
        />
      </div>
    </div>
  );
}
