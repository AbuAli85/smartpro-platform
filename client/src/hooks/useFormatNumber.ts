import { useLanguage } from '@/contexts/LanguageContext';
import {
  formatNumber as baseFormatNumber,
  formatCurrency as baseFormatCurrency,
  formatPercent as baseFormatPercent,
  formatDate as baseFormatDate,
  formatTime as baseFormatTime,
  formatDateTime as baseFormatDateTime,
  formatCompactNumber as baseFormatCompactNumber,
  formatPhoneNumber as baseFormatPhoneNumber,
  formatId as baseFormatId,
  toArabicNumerals,
} from '@/lib/formatNumber';

/**
 * Hook for locale-aware number formatting
 * Automatically uses current language from LanguageContext
 */
export function useFormatNumber() {
  const { language } = useLanguage();

  return {
    /**
     * Format number with current locale
     */
    formatNumber: (value: number | string | null | undefined, options?: Intl.NumberFormatOptions) =>
      baseFormatNumber(value, language, options),

    /**
     * Format currency with current locale
     */
    formatCurrency: (value: number | string | null | undefined, currency: string = 'OMR') =>
      baseFormatCurrency(value, language, currency),

    /**
     * Format percentage with current locale
     */
    formatPercent: (value: number | string | null | undefined, decimals: number = 1) =>
      baseFormatPercent(value, language, decimals),

    /**
     * Format date with current locale
     */
    formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) =>
      baseFormatDate(date, language, options),

    /**
     * Format time with current locale
     */
    formatTime: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) =>
      baseFormatTime(date, language, options),

    /**
     * Format date and time with current locale
     */
    formatDateTime: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) =>
      baseFormatDateTime(date, language, options),

    /**
     * Format compact numbers (1K, 1M) with current locale
     */
    formatCompactNumber: (value: number | string | null | undefined) =>
      baseFormatCompactNumber(value, language),

    /**
     * Format phone number with current locale
     */
    formatPhoneNumber: (phone: string | null | undefined) =>
      baseFormatPhoneNumber(phone, language),

    /**
     * Format ID/reference number with current locale
     */
    formatId: (id: string | number | null | undefined, prefix?: string) =>
      baseFormatId(id, language, prefix),

    /**
     * Convert any string/number to Arabic numerals
     */
    toArabicNumerals,

    /**
     * Current locale
     */
    locale: language,

    /**
     * Is current locale Arabic
     */
    isArabic: language === 'ar',
  };
}
