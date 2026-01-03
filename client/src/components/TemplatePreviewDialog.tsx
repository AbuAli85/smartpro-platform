import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Eye,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";

interface TemplatePreviewDialogProps {
  template: {
    id: number;
    templateName: string;
    templateNameAr?: string | null;
    description: string;
    descriptionAr?: string | null;
    category: string;
    isOfficial: boolean;
    isPremium: boolean;
    usageCount: number;
    variables: Array<{
      name: string;
      label: string;
      type: string;
      required: boolean;
      description?: string | null;
    }>;
    sampleContent?: string | null;
    estimatedTime?: number | null; // in minutes
  };
  trigger?: React.ReactNode;
}

export function TemplatePreviewDialog({
  template,
  trigger,
}: TemplatePreviewDialogProps) {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);

  const requiredFields = template.variables.filter((v) => v.required);
  const optionalFields = template.variables.filter((v) => !v.required);
  const estimatedTime = template.estimatedTime || Math.ceil(template.variables.length * 2); // 2 min per field

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Eye className="h-4 w-4" />
            {t("templates.preview")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">
                {language === "ar" && template.templateNameAr
                  ? template.templateNameAr
                  : template.templateName}
              </DialogTitle>
              <DialogDescription className="text-base">
                {language === "ar" && template.descriptionAr
                  ? template.descriptionAr
                  : template.description}
              </DialogDescription>
            </div>
            <div className="flex gap-2 ml-4">
              {template.isOfficial && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {t("templates.official")}
                </Badge>
              )}
              {template.isPremium && (
                <Badge variant="secondary" className="bg-[#FFD700] text-gray-900">
                  {t("templates.premium")}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">{t("templates.estimatedTime")}</p>
                      <p className="text-lg font-semibold">
                        {estimatedTime} {t("common.minutes")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">{t("templates.requiredFields")}</p>
                      <p className="text-lg font-semibold">{requiredFields.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Download className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">{t("templates.usedBy")}</p>
                      <p className="text-lg font-semibold">{template.usageCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Required Fields */}
            {requiredFields.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <h3 className="text-lg font-semibold">
                    {t("templates.requiredInformation")}
                  </h3>
                </div>
                <div className="space-y-2">
                  {requiredFields.map((field) => (
                    <Card key={field.name} className="bg-red-50 border-red-200">
                      <CardContent className="py-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{field.label}</p>
                            {field.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {field.description}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {field.type}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Optional Fields */}
            {optionalFields.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">
                    {t("templates.optionalInformation")}
                  </h3>
                </div>
                <div className="space-y-2">
                  {optionalFields.map((field) => (
                    <Card key={field.name} className="bg-blue-50 border-blue-200">
                      <CardContent className="py-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{field.label}</p>
                            {field.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {field.description}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {field.type}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Sample Content */}
            {template.sampleContent && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    {t("templates.sampleContent")}
                  </h3>
                  <Card className="bg-gray-50">
                    <CardContent className="pt-6">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                        {template.sampleContent}
                      </pre>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {/* What You'll Get */}
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-3">
                {t("templates.whatYouGet")}
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    {t("templates.professionalDocument")}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    {t("templates.editableFormat")}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    {t("templates.instantDownload")}
                  </span>
                </li>
                {template.isOfficial && (
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      {t("templates.officiallyRecognized")}
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("common.close")}
          </Button>
          <Link href={`/templates/${template.id}`}>
            <Button className="gap-2" onClick={() => setOpen(false)}>
              {t("templates.fillForm")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
