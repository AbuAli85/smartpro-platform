import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { Trash2, Crop, CheckSquare, Square, Loader2 } from 'lucide-react';

interface PhotoGalleryManagerProps {
  officeId: number;
  images: any[];
  onUpdate?: () => void;
}

export function PhotoGalleryManager({ officeId, images, onUpdate }: PhotoGalleryManagerProps) {
  const { t, language } = useLanguage();
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [cropSettings, setCropSettings] = useState({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    aspectRatio: 1,
  });

  const utils = trpc.useUtils();

  // Bulk delete mutation
  const bulkDeleteMutation = trpc.officeProfile.bulkDeleteImages.useMutation({
    onSuccess: (data) => {
      toast.success(`Successfully deleted ${data.deletedCount} images`);
      setSelectedIndices([]);
      setShowDeleteDialog(false);
      utils.sanadOffice.getOfficeById.invalidate({ id: officeId });
      onUpdate?.();
    },
    onError: (error) => {
      toast.error(`Failed to delete images: ${error.message}`);
    },
  });

  // Bulk crop mutation
  const bulkCropMutation = trpc.officeProfile.bulkApplyCropSettings.useMutation({
    onSuccess: (data) => {
      toast.success(`Successfully applied crop settings to ${data.updatedCount} images`);
      setSelectedIndices([]);
      setShowCropDialog(false);
      utils.sanadOffice.getOfficeById.invalidate({ id: officeId });
      onUpdate?.();
    },
    onError: (error) => {
      toast.error(`Failed to apply crop settings: ${error.message}`);
    },
  });

  const toggleSelection = (index: number) => {
    setSelectedIndices(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const selectAll = () => {
    setSelectedIndices(images.map((_, idx) => idx));
  };

  const deselectAll = () => {
    setSelectedIndices([]);
  };

  const handleBulkDelete = () => {
    bulkDeleteMutation.mutate({
      officeId,
      imageIndices: selectedIndices,
    });
  };

  const handleBulkCrop = () => {
    bulkCropMutation.mutate({
      officeId,
      imageIndices: selectedIndices,
      cropSettings,
    });
  };

  const allSelected = images.length > 0 && selectedIndices.length === images.length;
  const someSelected = selectedIndices.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{language === 'ar' ? 'إدارة معرض الصور' : 'Photo Gallery Management'}</span>
          <div className="flex gap-2">
            {someSelected ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deselectAll}
                >
                  <Square className="h-4 w-4 mr-2" />
                  {language === 'ar' ? 'إلغاء التحديد' : 'Deselect All'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCropDialog(true)}
                  disabled={!someSelected}
                >
                  <Crop className="h-4 w-4 mr-2" />
                  {language === 'ar' ? `قص (${selectedIndices.length})` : `Crop (${selectedIndices.length})`}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={!someSelected}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {language === 'ar' ? `حذف (${selectedIndices.length})` : `Delete (${selectedIndices.length})`}
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={selectAll}
                disabled={images.length === 0}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'تحديد الكل' : 'Select All'}
              </Button>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          {language === 'ar' 
            ? 'حدد صورًا متعددة لتطبيق عمليات مجمعة مثل الحذف أو إعدادات القص'
            : 'Select multiple images to apply bulk operations like delete or crop settings'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {images.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {language === 'ar' ? 'لا توجد صور' : 'No images'}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  selectedIndices.includes(index)
                    ? 'border-primary shadow-lg'
                    : 'border-transparent hover:border-gray-300'
                }`}
                onClick={() => toggleSelection(index)}
              >
                <img
                  src={typeof image === 'string' ? image : image.url}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 left-2">
                  <Checkbox
                    checked={selectedIndices.includes(index)}
                    onCheckedChange={() => toggleSelection(index)}
                    className="bg-white"
                  />
                </div>
                {selectedIndices.includes(index) && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <CheckSquare className="h-12 w-12 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {language === 'ar' ? 'تأكيد الحذف' : 'Confirm Deletion'}
              </DialogTitle>
              <DialogDescription>
                {language === 'ar'
                  ? `هل أنت متأكد من حذف ${selectedIndices.length} صورة؟ لا يمكن التراجع عن هذا الإجراء.`
                  : `Are you sure you want to delete ${selectedIndices.length} image(s)? This action cannot be undone.`}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={bulkDeleteMutation.isPending}
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={bulkDeleteMutation.isPending}
              >
                {bulkDeleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {language === 'ar' ? 'حذف' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Crop Settings Dialog */}
        <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {language === 'ar' ? 'تطبيق إعدادات القص' : 'Apply Crop Settings'}
              </DialogTitle>
              <DialogDescription>
                {language === 'ar'
                  ? `سيتم تطبيق هذه الإعدادات على ${selectedIndices.length} صورة`
                  : `These settings will be applied to ${selectedIndices.length} image(s)`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="crop-x">{language === 'ar' ? 'X' : 'X'}</Label>
                  <Input
                    id="crop-x"
                    type="number"
                    value={cropSettings.x}
                    onChange={(e) => setCropSettings(prev => ({ ...prev, x: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="crop-y">{language === 'ar' ? 'Y' : 'Y'}</Label>
                  <Input
                    id="crop-y"
                    type="number"
                    value={cropSettings.y}
                    onChange={(e) => setCropSettings(prev => ({ ...prev, y: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="crop-width">{language === 'ar' ? 'العرض' : 'Width'}</Label>
                  <Input
                    id="crop-width"
                    type="number"
                    value={cropSettings.width}
                    onChange={(e) => setCropSettings(prev => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="crop-height">{language === 'ar' ? 'الارتفاع' : 'Height'}</Label>
                  <Input
                    id="crop-height"
                    type="number"
                    value={cropSettings.height}
                    onChange={(e) => setCropSettings(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="crop-aspect">{language === 'ar' ? 'نسبة العرض إلى الارتفاع' : 'Aspect Ratio'}</Label>
                <Input
                  id="crop-aspect"
                  type="number"
                  step="0.1"
                  value={cropSettings.aspectRatio}
                  onChange={(e) => setCropSettings(prev => ({ ...prev, aspectRatio: parseFloat(e.target.value) || 1 }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCropDialog(false)}
                disabled={bulkCropMutation.isPending}
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                onClick={handleBulkCrop}
                disabled={bulkCropMutation.isPending}
              >
                {bulkCropMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {language === 'ar' ? 'تطبيق' : 'Apply'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
