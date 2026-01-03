/**
 * Arabic Number Formatting Utilities
 * 
 * Provides functions to convert Western numerals to Arabic-Indic numerals
 * and format numbers, dates, and currencies for Arabic locale
 */

// Map of Western (0-9) to Arabic-Indic numerals (٠-٩)
const WESTERN_TO_ARABIC_MAP: Record<string, string> = {
  '0': '٠',
  '1': '١',
  '2': '٢',
  '3': '٣',
  '4': '٤',
  '5': '٥',
  '6': '٦',
  '7': '٧',
  '8': '٨',
  '9': '٩',
};

/**
 * Convert Western numerals (0-9) to Arabic-Indic numerals (٠-٩)
 * @param value - Number or string containing Western numerals
 * @returns String with Arabic-Indic numerals
 */
export function toArabicNumerals(value: number | string): string {
  const str = String(value);
  return str.replace(/[0-9]/g, (digit) => WESTERN_TO_ARABIC_MAP[digit] || digit);
}

/**
 * Format a number with Arabic-Indic numerals and proper separators
 * @param value - Number to format
 * @param options - Formatting options
 * @returns Formatted string with Arabic-Indic numerals
 */
export function formatArabicNumber(
  value: number,
  options?: {
    decimals?: number;
    useThousandsSeparator?: boolean;
  }
): string {
  const { decimals, useThousandsSeparator = true } = options || {};
  
  let formatted: string;
  
  if (decimals !== undefined) {
    formatted = value.toFixed(decimals);
  } else {
    formatted = String(value);
  }
  
  // Add thousands separator if requested
  if (useThousandsSeparator) {
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '،'); // Arabic comma
    formatted = parts.join('.');
  }
  
  return toArabicNumerals(formatted);
}

/**
 * Format currency in Omani Rials with Arabic numerals
 * @param amount - Amount in OMR
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatArabicCurrency(
  amount: number,
  options?: {
    showCurrencyCode?: boolean;
    decimals?: number;
  }
): string {
  const { showCurrencyCode = true, decimals = 3 } = options || {};
  
  const formattedAmount = formatArabicNumber(amount, {
    decimals,
    useThousandsSeparator: true,
  });
  
  if (showCurrencyCode) {
    return `${formattedAmount} ر.ع.`; // OMR in Arabic
  }
  
  return formattedAmount;
}

/**
 * Format a date in Arabic style
 * @param date - Date to format
 * @param options - Formatting options
 * @returns Formatted date string with Arabic numerals
 */
export function formatArabicDate(
  date: Date | string | number,
  options?: {
    format?: 'short' | 'medium' | 'long';
    includeTime?: boolean;
  }
): string {
  const { format = 'medium', includeTime = false } = options || {};
  
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  const day = dateObj.getDate();
  const month = dateObj.getMonth() + 1;
  const year = dateObj.getFullYear();
  
  let formatted: string;
  
  switch (format) {
    case 'short':
      // DD/MM/YYYY
      formatted = `${day}/${month}/${year}`;
      break;
    case 'long':
      // DD Month YYYY (with Arabic month names)
      const arabicMonths = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ];
      formatted = `${toArabicNumerals(day)} ${arabicMonths[month - 1]} ${toArabicNumerals(year)}`;
      break;
    case 'medium':
    default:
      // DD-MM-YYYY
      formatted = `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
      formatted = toArabicNumerals(formatted);
      break;
  }
  
  if (includeTime) {
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    formatted += ` ${toArabicNumerals(timeStr)}`;
  }
  
  return formatted;
}

/**
 * Format a phone number in Arabic style
 * @param phoneNumber - Phone number to format
 * @returns Formatted phone number with Arabic numerals
 */
export function formatArabicPhoneNumber(phoneNumber: string): string {
  // Remove any non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format as: +968 XXXX XXXX for Oman
  if (cleaned.startsWith('968') && cleaned.length === 11) {
    const formatted = `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
    return toArabicNumerals(formatted);
  }
  
  // Format as: XXXX XXXX for local numbers
  if (cleaned.length === 8) {
    const formatted = `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    return toArabicNumerals(formatted);
  }
  
  // Default: just convert to Arabic numerals
  return toArabicNumerals(phoneNumber);
}

/**
 * Format a percentage with Arabic numerals
 * @param value - Percentage value (0-100)
 * @param options - Formatting options
 * @returns Formatted percentage string
 */
export function formatArabicPercentage(
  value: number,
  options?: {
    decimals?: number;
  }
): string {
  const { decimals = 1 } = options || {};
  const formatted = formatArabicNumber(value, { decimals, useThousandsSeparator: false });
  return `${formatted}٪`; // Arabic percent sign
}

/**
 * Format a compact number (e.g., 1000 → 1k, 1000000 → 1M)
 * @param value - Number to format
 * @returns Compact formatted string with Arabic numerals
 */
export function formatArabicCompactNumber(value: number): string {
  if (value >= 1000000) {
    return `${formatArabicNumber(value / 1000000, { decimals: 1 })}م`; // Million
  }
  if (value >= 1000) {
    return `${formatArabicNumber(value / 1000, { decimals: 1 })}ك`; // Thousand
  }
  return formatArabicNumber(value, { decimals: 0 });
}

/**
 * Check if current language is Arabic
 * @param language - Current language code
 * @returns True if Arabic
 */
export function isArabicLanguage(language: string): boolean {
  return language === 'ar' || language.startsWith('ar-');
}

/**
 * Conditionally format number based on current language
 * @param value - Number to format
 * @param language - Current language code
 * @param formatter - Optional custom formatter function
 * @returns Formatted number (Arabic numerals if Arabic language)
 */
export function formatNumberForLanguage(
  value: number,
  language: string,
  formatter?: (value: number) => string
): string {
  const formatted = formatter ? formatter(value) : String(value);
  return isArabicLanguage(language) ? toArabicNumerals(formatted) : formatted;
}
