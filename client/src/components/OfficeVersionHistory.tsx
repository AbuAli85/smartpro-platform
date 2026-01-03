import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { trpc } from '@/lib/trpc';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { History, RotateCcw, Eye, Loader2, Clock, User, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface OfficeVersionHistoryProps {
  officeId: number;
  onRevert?: () => void;
}

export function OfficeVersionHistory({ officeId, onRevert }: OfficeVersionHistoryProps) {
  const { t, language } = useLanguage();
  const [showHistory, setShowHistory] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<any>(null);
  const [showRevertDialog, setShowRevertDialog] = useState(false);
  const [showVersionDetails, setShowVersionDetails] = useState(false);

  const utils = trpc.useUtils();

  // Fetch version history
  const { data: versions, isLoading } = trpc.officeProfile.getVersionHistory.useQuery(
    { officeId },
    { enabled: showHistory }
  );

  // Revert mutation
  const revertMutation = trpc.officeProfile.revertToVersion.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم استعادة النسخة بنجاح' : 'Version restored successfully');
      setShowRevertDialog(false);
      setShowHistory(false);
      utils.sanadOffice.getOfficeById.invalidate({ id: officeId });
      onRevert?.();
    },
    onError: (error) => {
      toast.error(`Failed to revert: ${error.message}`);
    },
  });

  const handleRevert = () => {
    if (!selectedVersion) return;

    revertMutation.mutate({
      officeId,
      versionId: selectedVersion.id,
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPp');
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowHistory(true)}
      >
        <History className="h-4 w-4 mr-2" />
        {language === 'ar' ? 'سجل الإصدارات' : 'Version History'}
      </Button>

      {/* Version History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {language === 'ar' ? 'سجل إصدارات ملف المكتب' : 'Office Profile Version History'}
            </DialogTitle>
            <DialogDescription>
              {language === 'ar'
                ? 'عرض واستعادة الإصدارات السابقة من ملف المكتب'
                : 'View and restore previous versions of your office profile'}
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : versions && versions.length > 0 ? (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {versions.map((version, index) => (
                  <Card
                    key={version.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      index === 0 ? 'border-primary' : ''
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            {language === 'ar' ? 'الإصدار' : 'Version'} {version.versionNumber}
                            {index === 0 && (
                              <Badge variant="default">
                                {language === 'ar' ? 'الحالي' : 'Current'}
                              </Badge>
                            )}
                            {version.versionLabel && (
                              <Badge variant="outline">{version.versionLabel}</Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="flex flex-col gap-1">
                            <span className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              {formatDate(version.createdAt)}
                            </span>
                            <span className="flex items-center gap-2">
                              <User className="h-3 w-3" />
                              {version.changedByName}
                            </span>
                            {version.changeDescription && (
                              <span className="flex items-center gap-2">
                                <FileText className="h-3 w-3" />
                                {version.changeDescription}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedVersion(version);
                              setShowVersionDetails(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {index !== 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedVersion(version);
                                setShowRevertDialog(true);
                              }}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    {version.changedFields && version.changedFields.length > 0 && (
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {version.changedFields.map((field: string) => (
                            <Badge key={field} variant="secondary" className="text-xs">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {language === 'ar' ? 'لا توجد إصدارات سابقة' : 'No previous versions'}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Revert Confirmation Dialog */}
      <Dialog open={showRevertDialog} onOpenChange={setShowRevertDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'ar' ? 'تأكيد الاستعادة' : 'Confirm Revert'}
            </DialogTitle>
            <DialogDescription>
              {language === 'ar'
                ? `هل أنت متأكد من استعادة الإصدار ${selectedVersion?.versionNumber}؟ سيتم إنشاء نسخة جديدة من التغييرات الحالية قبل الاستعادة.`
                : `Are you sure you want to revert to version ${selectedVersion?.versionNumber}? A new version will be created with your current changes before reverting.`}
            </DialogDescription>
          </DialogHeader>
          {selectedVersion && (
            <Card>
              <CardContent className="pt-6 space-y-2">
                <div>
                  <span className="font-medium">{language === 'ar' ? 'الإصدار:' : 'Version:'}</span>{' '}
                  {selectedVersion.versionNumber}
                </div>
                {selectedVersion.versionLabel && (
                  <div>
                    <span className="font-medium">{language === 'ar' ? 'التسمية:' : 'Label:'}</span>{' '}
                    {selectedVersion.versionLabel}
                  </div>
                )}
                <div>
                  <span className="font-medium">{language === 'ar' ? 'التاريخ:' : 'Date:'}</span>{' '}
                  {formatDate(selectedVersion.createdAt)}
                </div>
                <div>
                  <span className="font-medium">{language === 'ar' ? 'بواسطة:' : 'By:'}</span>{' '}
                  {selectedVersion.changedByName}
                </div>
              </CardContent>
            </Card>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRevertDialog(false)}
              disabled={revertMutation.isPending}
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={handleRevert}
              disabled={revertMutation.isPending}
            >
              {revertMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <RotateCcw className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'استعادة' : 'Revert'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version Details Dialog */}
      <Dialog open={showVersionDetails} onOpenChange={setShowVersionDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {language === 'ar' ? 'تفاصيل الإصدار' : 'Version Details'}
            </DialogTitle>
          </DialogHeader>
          {selectedVersion && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    {language === 'ar' ? 'معلومات الإصدار' : 'Version Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium">{language === 'ar' ? 'رقم الإصدار:' : 'Version Number:'}</span>
                      <p>{selectedVersion.versionNumber}</p>
                    </div>
                    {selectedVersion.versionLabel && (
                      <div>
                        <span className="text-sm font-medium">{language === 'ar' ? 'التسمية:' : 'Label:'}</span>
                        <p>{selectedVersion.versionLabel}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-medium">{language === 'ar' ? 'التاريخ:' : 'Date:'}</span>
                      <p>{formatDate(selectedVersion.createdAt)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">{language === 'ar' ? 'المستخدم:' : 'User:'}</span>
                      <p>{selectedVersion.changedByName}</p>
                    </div>
                  </div>
                  {selectedVersion.changeDescription && (
                    <div>
                      <span className="text-sm font-medium">{language === 'ar' ? 'الوصف:' : 'Description:'}</span>
                      <p className="text-muted-foreground">{selectedVersion.changeDescription}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedVersion.changedFields && selectedVersion.changedFields.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      {language === 'ar' ? 'الحقول المتغيرة' : 'Changed Fields'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedVersion.changedFields.map((field: string) => (
                        <Badge key={field} variant="secondary">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
