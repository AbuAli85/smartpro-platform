import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { Eye, Save, X, Loader2, MapPin, Phone, Mail, Globe } from 'lucide-react';

interface OfficeProfilePreviewProps {
  officeId: number;
  changes: Record<string, any>;
  onSave: () => void;
  onDiscard: () => void;
}

export function OfficeProfilePreview({ officeId, changes, onSave, onDiscard }: OfficeProfilePreviewProps) {
  const { t, language } = useLanguage();
  const [showPreview, setShowPreview] = useState(false);

  // Generate preview data
  const { data: previewData, isLoading } = trpc.officeProfile.generatePreview.useQuery(
    { officeId, changes },
    { enabled: showPreview }
  );

  const hasChanges = Object.keys(changes).length > 0;

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setShowPreview(true)}
          disabled={!hasChanges}
        >
          <Eye className="h-4 w-4 mr-2" />
          {language === 'ar' ? 'معاينة التغييرات' : 'Preview Changes'}
        </Button>
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {language === 'ar' ? 'معاينة ملف المكتب' : 'Office Profile Preview'}
            </DialogTitle>
            <DialogDescription>
              {language === 'ar'
                ? 'هذه معاينة لكيفية ظهور ملف المكتب بعد حفظ التغييرات'
                : 'This is how your office profile will look after saving the changes'}
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : previewData ? (
            <div className="space-y-6">
              {/* Side-by-side comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Version */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      {language === 'ar' ? 'النسخة الحالية' : 'Current Version'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <OfficePreviewCard office={previewData.current} language={language} />
                  </CardContent>
                </Card>

                {/* Preview Version */}
                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      {language === 'ar' ? 'المعاينة' : 'Preview'}
                      <Badge variant="default">
                        {language === 'ar' ? 'جديد' : 'New'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <OfficePreviewCard office={previewData.preview} language={language} />
                  </CardContent>
                </Card>
              </div>

              {/* Changed Fields Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    {language === 'ar' ? 'الحقول المتغيرة' : 'Changed Fields'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(previewData.changes).map(([field, value]) => (
                      <div key={field} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="font-medium">{field}</span>
                        <Badge variant="outline">
                          {language === 'ar' ? 'تم التعديل' : 'Modified'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowPreview(false);
                onDiscard();
              }}
            >
              <X className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'تجاهل التغييرات' : 'Discard Changes'}
            </Button>
            <Button
              onClick={() => {
                setShowPreview(false);
                onSave();
              }}
            >
              <Save className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Helper component to display office preview card
function OfficePreviewCard({ office, language }: { office: any; language: string }) {
  return (
    <div className="space-y-3">
      {/* Logo and Cover */}
      {office.logoUrl && (
        <div className="flex justify-center">
          <img src={office.logoUrl} alt="Logo" className="h-16 w-16 rounded-full object-cover" />
        </div>
      )}

      {/* Office Name */}
      <div>
        <h3 className="font-bold text-lg">
          {language === 'ar' ? office.nameAr : office.nameEn}
        </h3>
      </div>

      {/* Description */}
      {(office.descriptionAr || office.descriptionEn) && (
        <p className="text-sm text-muted-foreground line-clamp-3">
          {language === 'ar' ? office.descriptionAr : office.descriptionEn}
        </p>
      )}

      {/* Contact Info */}
      <div className="space-y-2 text-sm">
        {office.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{office.email}</span>
          </div>
        )}
        {office.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{office.phone}</span>
          </div>
        )}
        {office.website && (
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{office.website}</span>
          </div>
        )}
        {office.governorate && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{office.governorate}, {office.wilayat}</span>
          </div>
        )}
      </div>

      {/* Images Gallery */}
      {office.images && office.images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {office.images.slice(0, 6).map((img: any, idx: number) => (
            <img
              key={idx}
              src={typeof img === 'string' ? img : img.url}
              alt={`Gallery ${idx + 1}`}
              className="w-full h-20 object-cover rounded"
            />
          ))}
        </div>
      )}
    </div>
  );
}
