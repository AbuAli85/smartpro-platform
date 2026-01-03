import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ImageUpload';
import { DraggablePhotoGrid } from '@/components/DraggablePhotoGrid';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { PhotoGalleryManager } from '@/components/PhotoGalleryManager';
import { OfficeProfilePreview } from '@/components/OfficeProfilePreview';
import { OfficeVersionHistory } from '@/components/OfficeVersionHistory';

export function OfficeEditPage() {
  const [, params] = useRoute('/provider/office/:id/edit');
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();

  const officeId = params?.id ? parseInt(params.id) : null;

  // Fetch office data
  const { data: office, isLoading } = trpc.sanadOffice.getOfficeById.useQuery(
    { id: officeId! },
    { enabled: !!officeId }
  );

  // Track changes for preview
  const [originalData, setOriginalData] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    logoUrl: '',
    images: [] as string[],
    email: '',
    phone: '',
    whatsapp: '',
  });

  // Populate form when office data loads
  useEffect(() => {
    if (office) {
      const data = {
        nameAr: office.nameAr || '',
        nameEn: office.nameEn || '',
        descriptionAr: office.descriptionAr || '',
        descriptionEn: office.descriptionEn || '',
        logoUrl: office.logoUrl || '',
        images: office.images || [],
        email: office.email || '',
        phone: office.phone || '',
        whatsapp: office.whatsapp || '',
      };
      setFormData(data);
      setOriginalData(data);
    }
  }, [office]);

  // Track changes
  useEffect(() => {
    if (originalData) {
      const changed = Object.keys(formData).some(
        key => JSON.stringify(formData[key as keyof typeof formData]) !== JSON.stringify(originalData[key])
      );
      setHasChanges(changed);
    }
  }, [formData, originalData]);

  // Update mutation
  const updateOfficeMutation = trpc.sanadOffice.updateOffice.useMutation({
    onSuccess: () => {
      toast.success(t('office.edit.successDescription'));
      setLocation(`/provider/office/${officeId}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!officeId) return;

    updateOfficeMutation.mutate({
      id: officeId,
      ...formData,
    });
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getChanges = () => {
    if (!originalData) return {};
    const changes: Record<string, any> = {};
    Object.keys(formData).forEach(key => {
      if (JSON.stringify(formData[key as keyof typeof formData]) !== JSON.stringify(originalData[key])) {
        changes[key] = formData[key as keyof typeof formData];
      }
    });
    return changes;
  };

  const handleSaveWithPreview = () => {
    if (!officeId) return;
    updateOfficeMutation.mutate({
      id: officeId,
      ...formData,
    });
  };

  const handleDiscardChanges = () => {
    if (originalData) {
      setFormData(originalData);
      toast.info(language === 'ar' ? 'تم تجاهل التغييرات' : 'Changes discarded');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!office) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">{t('office.edit.notFound')}</p>
            <Button
              onClick={() => setLocation('/provider/dashboard')}
              className="mt-4"
            >
              {t('common.backToDashboard')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation(`/provider/office/${officeId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t('office.edit.title')}</h1>
            <p className="text-muted-foreground">{t('office.edit.description')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <OfficeVersionHistory officeId={officeId!} onRevert={() => window.location.reload()} />
          {hasChanges && (
            <OfficeProfilePreview
              officeId={officeId!}
              changes={getChanges()}
              onSave={handleSaveWithPreview}
              onDiscard={handleDiscardChanges}
            />
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('office.edit.basicInfo')}</CardTitle>
            <CardDescription>{t('office.edit.basicInfoDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nameAr">{t('office.edit.nameAr')}</Label>
                <Input
                  id="nameAr"
                  value={formData.nameAr}
                  onChange={(e) => handleInputChange('nameAr', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameEn">{t('office.edit.nameEn')}</Label>
                <Input
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) => handleInputChange('nameEn', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descriptionAr">{t('office.edit.descriptionAr')}</Label>
              <Textarea
                id="descriptionAr"
                value={formData.descriptionAr}
                onChange={(e) => handleInputChange('descriptionAr', e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descriptionEn">{t('office.edit.descriptionEn')}</Label>
              <Textarea
                id="descriptionEn"
                value={formData.descriptionEn}
                onChange={(e) => handleInputChange('descriptionEn', e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Logo */}
        <Card>
          <CardHeader>
            <CardTitle>{t('office.edit.logo')}</CardTitle>
            <CardDescription>{t('office.edit.logoDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              value={formData.logoUrl}
              onChange={(value) => handleInputChange('logoUrl', value as string)}
              multiple={false}
              enableCrop={true}
              cropAspectRatio={1}
              label={t('office.edit.uploadLogo')}
              helperText={t('office.edit.logoHelperText')}
            />
          </CardContent>
        </Card>

        {/* Photos */}
        <Card>
          <CardHeader>
            <CardTitle>{t('office.edit.photos')}</CardTitle>
            <CardDescription>{t('office.edit.photosDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUpload
              value={formData.images}
              onChange={(value) => handleInputChange('images', value as string[])}
              multiple={true}
              maxFiles={10}
              enableCrop={true}
              cropAspectRatio={16/9}
              label={t('office.edit.uploadPhotos')}
              helperText={t('office.edit.photosHelperText')}
            />

            {formData.images.length > 0 && (
              <div className="space-y-2">
                <Label>{t('office.edit.reorderPhotos')}</Label>
                <DraggablePhotoGrid
                  photos={formData.images}
                  onChange={(photos) => handleInputChange('images', photos)}
                  helperText={t('office.edit.reorderPhotosHelperText')}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Photo Gallery Manager - Bulk Operations */}
        {formData.images.length > 0 && (
          <PhotoGalleryManager
            officeId={officeId!}
            images={formData.images}
            onUpdate={() => {
              // Refetch office data after bulk operations
              window.location.reload();
            }}
          />
        )}

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('office.edit.contactInfo')}</CardTitle>
            <CardDescription>{t('office.edit.contactInfoDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('office.edit.email')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">{t('office.edit.phone')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">{t('office.edit.whatsapp')}</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setLocation(`/provider/office/${officeId}`)}
            disabled={updateOfficeMutation.isPending}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            disabled={updateOfficeMutation.isPending}
          >
            {updateOfficeMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('common.saving')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {t('common.saveChanges')}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
