import { useTranslation } from 'react-i18next';
import {
  toArabicNumerals,
  formatArabicNumber,
  formatArabicCurrency,
  formatArabicDate,
  formatArabicPhoneNumber,
  formatArabicPercentage,
  formatArabicCompactNumber,
  isArabicLanguage,
  formatNumberForLanguage,
} from '@/lib/arabicNumbers';

/**
 * React hook for Arabic number formatting
 * Automatically uses Arabic numerals when the current language is Arabic
 */
export function useArabicNumbers() {
  const { i18n } = useTranslation();
  const isArabic = isArabicLanguage(i18n.language);

  return {
    /**
     * Convert to Arabic numerals if current language is Arabic
     */
    toArabic: (value: number | string) => {
      return isArabic ? toArabicNumerals(value) : String(value);
    },

    /**
     * Format number with proper separators
     */
    formatNumber: (value: number, options?: { decimals?: number; useThousandsSeparator?: boolean }) => {
      if (isArabic) {
        return formatArabicNumber(value, options);
      }
      const formatted = options?.decimals !== undefined 
        ? value.toFixed(options.decimals)
        : String(value);
      if (options?.useThousandsSeparator !== false) {
        const parts = formatted.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
      }
      return formatted;
    },

    /**
     * Format currency (OMR)
     */
    formatCurrency: (amount: number, options?: { showCurrencyCode?: boolean; decimals?: number }) => {
      if (isArabic) {
        return formatArabicCurrency(amount, options);
      }
      const decimals = options?.decimals ?? 3;
      const formatted = amount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return options?.showCurrencyCode !== false ? `${formatted} OMR` : formatted;
    },

    /**
     * Format date
     */
    formatDate: (date: Date | string | number, options?: { format?: 'short' | 'medium' | 'long'; includeTime?: boolean }) => {
      if (isArabic) {
        return formatArabicDate(date, options);
      }
      const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
      const format = options?.format || 'medium';
      
      if (format === 'short') {
        return dateObj.toLocaleDateString('en-US');
      } else if (format === 'long') {
        return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      } else {
        return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
      }
    },

    /**
     * Format phone number
     */
    formatPhone: (phoneNumber: string) => {
      if (isArabic) {
        return formatArabicPhoneNumber(phoneNumber);
      }
      // Format for English: keep as is or apply basic formatting
      const cleaned = phoneNumber.replace(/\D/g, '');
      if (cleaned.startsWith('968') && cleaned.length === 11) {
        return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
      }
      if (cleaned.length === 8) {
        return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
      }
      return phoneNumber;
    },

    /**
     * Format percentage
     */
    formatPercentage: (value: number, options?: { decimals?: number }) => {
      if (isArabic) {
        return formatArabicPercentage(value, options);
      }
      const decimals = options?.decimals ?? 1;
      return `${value.toFixed(decimals)}%`;
    },

    /**
     * Format compact number (1k, 1M, etc.)
     */
    formatCompact: (value: number) => {
      if (isArabic) {
        return formatArabicCompactNumber(value);
      }
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      }
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return String(value);
    },

    /**
     * Check if current language is Arabic
     */
    isArabic,
  };
}
