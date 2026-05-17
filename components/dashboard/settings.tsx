'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Building2, Upload, X, Globe, Phone, Save } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import apiClient, { uploadFile } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Country configurations with phone prefixes
const COUNTRY_CONFIGS: Record<string, { prefix: string; name: string; nameAr: string; flag: string; example: string }> = {
  IQ: { prefix: '+964', name: 'Iraq', nameAr: 'العراق', flag: '🇮🇶', example: '770 123 4567' },
  SA: { prefix: '+966', name: 'Saudi Arabia', nameAr: 'السعودية', flag: '🇸🇦', example: '50 123 4567' },
  AE: { prefix: '+971', name: 'United Arab Emirates', nameAr: 'الإمارات', flag: '🇦🇪', example: '50 123 4567' },
  KW: { prefix: '+965', name: 'Kuwait', nameAr: 'الكويت', flag: '🇰🇼', example: '500 12345' },
  QA: { prefix: '+974', name: 'Qatar', nameAr: 'قطر', flag: '🇶🇦', example: '5000 1234' },
  BH: { prefix: '+973', name: 'Bahrain', nameAr: 'البحرين', flag: '🇧🇭', example: '3500 1234' },
  OM: { prefix: '+968', name: 'Oman', nameAr: 'عمان', flag: '🇴🇲', example: '9000 1234' },
  EG: { prefix: '+20', name: 'Egypt', nameAr: 'مصر', flag: '🇪🇬', example: '100 123 4567' },
  JO: { prefix: '+962', name: 'Jordan', nameAr: 'الأردن', flag: '🇯🇴', example: '7 7012 3456' },
  LB: { prefix: '+961', name: 'Lebanon', nameAr: 'لبنان', flag: '🇱🇧', example: '3 123 456' },
  SY: { prefix: '+963', name: 'Syria', nameAr: 'سوريا', flag: '🇸🇾', example: '930 123 456' },
  YE: { prefix: '+967', name: 'Yemen', nameAr: 'اليمن', flag: '🇾🇪', example: '730 123 456' },
  TR: { prefix: '+90', name: 'Turkey', nameAr: 'تركيا', flag: '🇹🇷', example: '530 123 4567' },
  IR: { prefix: '+98', name: 'Iran', nameAr: 'إيران', flag: '🇮🇷', example: '912 123 4567' },
};

interface WorkspaceSettings {
  id: string;
  name: string;
  subdomain: string;
  logo: string | null;
  countryCode: string;
  plan: string;
  status: string;
}

export function SettingsPage() {
  const { t } = useTranslation();
  const { hasPermission, tenant } = useAuth();
  const canWrite = hasPermission('settings', 'write');

  const [settings, setSettings] = React.useState<WorkspaceSettings | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [formData, setFormData] = React.useState<Partial<WorkspaceSettings>>({});

  // Fetch settings on mount
  React.useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get<WorkspaceSettings>('/settings');
      setSettings(data);
      setFormData({
        name: data.name,
        logo: data.logo,
        countryCode: data.countryCode,
      });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error(t.messages.error.fetchFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof WorkspaceSettings, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Compress image if too large (max 2MB)
      let processedFile = file;
      if (file.size > 2 * 1024 * 1024) {
        processedFile = await compressImage(file);
      }

      const key = `logos/${Date.now()}-${processedFile.name}`;
      const publicUrl = await uploadFile(processedFile, key);

      setFormData((prev) => ({ ...prev, logo: publicUrl }));
      toast.success(t.messages.success.uploaded);
    } catch (error) {
      console.error('Failed to upload logo:', error);
      toast.error(t.messages.error.upload);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Calculate new dimensions (max 400px for logo)
          const maxSize = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            'image/jpeg',
            0.8
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logo: null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) {
      toast.error(t.messages.error.forbidden);
      return;
    }

    if (!formData.name?.trim()) {
      toast.error(t.validation.required);
      return;
    }

    setIsSaving(true);
    try {
      const updated = await apiClient.patch<WorkspaceSettings>('/settings', {
        name: formData.name,
        logo: formData.logo,
        countryCode: formData.countryCode,
      });
      setSettings(updated);
      toast.success(t.messages.success.saved);
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error(t.messages.error.saveFailed);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">{t.messages.loading}</p>
      </div>
    );
  }

  const selectedCountry = formData.countryCode || 'IQ';
  const countryConfig = COUNTRY_CONFIGS[selectedCountry];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">{t.nav.settings}</h2>
        <p className="text-muted-foreground">{t.settings?.subtitle || 'إعدادات النظام والورشة'}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Workspace Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5" />
              {t.settings?.workspaceInfo || 'معلومات الورشة'}
            </CardTitle>
            <CardDescription>
              {t.settings?.workspaceDescription || 'تعديل اسم الورشة والشعار'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Workspace Name */}
            <div className="space-y-2">
              <Label htmlFor="name">{t.settings?.workspaceName || 'اسم الورشة'}</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder={t.settings?.workspaceNamePlaceholder || 'مثال: ورشة السيارات الذهبية'}
                disabled={!canWrite}
                required
              />
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>{t.settings?.logo || 'الشعار'}</Label>
              <div className="space-y-3">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={!canWrite || isUploading}
                  className="hidden"
                />
                {formData.logo ? (
                  <div className="relative border-2 border-dashed rounded-lg overflow-hidden flex justify-center p-4 bg-muted/50">
                    <img
                      src={formData.logo}
                      alt="Workspace logo"
                      className="max-h-32 max-w-32 object-contain"
                    />
                    {canWrite && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => document.getElementById('logo')?.click()}
                          disabled={isUploading}
                        >
                          <Upload className="size-4 mr-2" />
                          {t.actions.upload}
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveLogo}
                        >
                          <X className="size-4 mr-2" />
                          {t.actions.delete}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => canWrite && document.getElementById('logo')?.click()}
                    className={cn(
                      'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                      canWrite
                        ? 'cursor-pointer hover:border-primary hover:bg-primary/5'
                        : 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <Upload className="size-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {isUploading ? t.messages.loading : t.actions.upload}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t.settings?.logoHint || 'PNG, JPG up to 2MB'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Country & Phone Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="size-5" />
              {t.settings?.regionSettings || 'إعدادات المنطقة'}
            </CardTitle>
            <CardDescription>
              {t.settings?.regionDescription || 'اختيار الدولة لتنسيق أرقام الهاتف'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Country Selection */}
            <div className="space-y-2">
              <Label htmlFor="country">{t.settings?.country || 'الدولة'}</Label>
              <Select
                value={formData.countryCode}
                onValueChange={(value) => handleChange('countryCode', value)}
                disabled={!canWrite}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(COUNTRY_CONFIGS).map(([code, config]) => (
                    <SelectItem key={code} value={code}>
                      <span className="mr-2">{config.flag}</span>
                      {config.nameAr} ({config.prefix})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Phone Format Preview */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="size-4" />
                {t.settings?.phoneFormat || 'تنسيق رقم الهاتف'}
              </Label>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  {t.settings?.phoneFormatDescription || 'سيتم استخدام هذا البادئة لجميع أرقام الهاتف:'}
                </p>
                <p className="text-lg font-mono font-semibold" dir="ltr">
                  {countryConfig?.prefix} XXX XXX XXXX
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {t.settings?.phoneExample || 'مثال'}: {countryConfig?.prefix} {countryConfig?.example}
                </p>
              </div>
            </div>

            {/* Subdomain Info (Read-only) */}
            <div className="space-y-2">
              <Label>{t.settings?.subdomain || 'النطاق الفرعي'}</Label>
              <Input value={settings?.subdomain || ''} disabled readOnly />
              <p className="text-xs text-muted-foreground">
                {t.settings?.subdomainHint || 'لا يمكن تغيير النطاق الفرعي بعد إنشاء الحساب'}
              </p>
            </div>

            {/* Plan Info (Read-only) */}
            <div className="space-y-2">
              <Label>{t.settings?.plan || 'الخطة'}</Label>
              <Input
                value={
                  settings?.plan
                    ? (t.settings?.plans as Record<string, string>)?.[settings.plan.toLowerCase()] || settings.plan
                    : ''
                }
                disabled
                readOnly
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        {canWrite && (
          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving} className="min-w-[150px]">
              <Save className="size-4 mr-2" />
              {isSaving ? t.messages.loading : t.actions.save}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
