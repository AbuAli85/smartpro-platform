/**
 * Comprehensive Arabic Numeral Formatting Utility
 * Converts Western numerals (0-9) to Eastern Arabic numerals (٠-٩)
 */

const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/**
 * Convert Western numerals to Eastern Arabic numerals
 */
export function toArabicNumerals(value: string | number): string {
  const str = String(value);
  return str.replace(/\d/g, (digit) => arabicNumerals[parseInt(digit)]);
}

/**
 * Format number with Arabic numerals and locale-aware formatting
 * @param value - Number to format
 * @param locale - Locale code ('ar' for Arabic, 'en' for English)
 * @param options - Intl.NumberFormat options
 */
export function formatNumber(
  value: number | string | null | undefined,
  locale: string = 'en',
  options?: Intl.NumberFormatOptions
): string {
  if (value === null || value === undefined || value === '') return '';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return String(value);

  // Format with locale-aware separators
  const formatted = new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    maximumFractionDigits: 2,
    ...options,
  }).format(numValue);

  // Convert to Arabic numerals if locale is Arabic
  return locale === 'ar' ? toArabicNumerals(formatted) : formatted;
}

/**
 * Format currency with Arabic numerals
 */
export function formatCurrency(
  value: number | string | null | undefined,
  locale: string = 'en',
  currency: string = 'OMR'
): string {
  if (value === null || value === undefined || value === '') return '';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return String(value);

  const formatted = new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);

  return locale === 'ar' ? toArabicNumerals(formatted) : formatted;
}

/**
 * Format percentage with Arabic numerals
 */
export function formatPercent(
  value: number | string | null | undefined,
  locale: string = 'en',
  decimals: number = 1
): string {
  if (value === null || value === undefined || value === '') return '';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return String(value);

  const formatted = new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numValue / 100);

  return locale === 'ar' ? toArabicNumerals(formatted) : formatted;
}

/**
 * Format date with Arabic numerals
 */
export function formatDate(
  date: Date | string | number,
  locale: string = 'en',
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return String(date);

  const formatted = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(dateObj);

  return locale === 'ar' ? toArabicNumerals(formatted) : formatted;
}

/**
 * Format time with Arabic numerals
 */
export function formatTime(
  date: Date | string | number,
  locale: string = 'en',
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return String(date);

  const formatted = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(dateObj);

  return locale === 'ar' ? toArabicNumerals(formatted) : formatted;
}

/**
 * Format date and time with Arabic numerals
 */
export function formatDateTime(
  date: Date | string | number,
  locale: string = 'en',
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return String(date);

  const formatted = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(dateObj);

  return locale === 'ar' ? toArabicNumerals(formatted) : formatted;
}

/**
 * Format compact numbers (1K, 1M, etc.) with Arabic numerals
 */
export function formatCompactNumber(
  value: number | string | null | undefined,
  locale: string = 'en'
): string {
  if (value === null || value === undefined || value === '') return '';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return String(value);

  const formatted = new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(numValue);

  return locale === 'ar' ? toArabicNumerals(formatted) : formatted;
}

/**
 * Format phone number with Arabic numerals
 */
export function formatPhoneNumber(
  phone: string | null | undefined,
  locale: string = 'en'
): string {
  if (!phone) return '';
  return locale === 'ar' ? toArabicNumerals(phone) : phone;
}

/**
 * Format ID/reference number with Arabic numerals
 */
export function formatId(
  id: string | number | null | undefined,
  locale: string = 'en',
  prefix?: string
): string {
  if (id === null || id === undefined) return '';
  const idStr = String(id);
  const formatted = prefix ? `${prefix}${idStr}` : idStr;
  return locale === 'ar' ? toArabicNumerals(formatted) : formatted;
}
