/**
 * Hijri Date Converter Utility
 * 
 * Provides functions to convert between Gregorian and Hijri (Islamic) dates
 * Used for generating official Omani documents that require both date formats
 */

import { toHijri, toGregorian } from 'hijri-converter';

// Type definition for Hijri date
interface HijriDate {
  hy: number; // Hijri year
  hm: number; // Hijri month (1-12)
  hd: number; // Hijri day
}

/**
 * Convert a Gregorian date to Hijri date
 * Returns formatted Hijri date string in Arabic
 */
export function gregorianToHijri(date: Date): string {
  const hijriDate = toHijri(
    date.getFullYear(),
    date.getMonth() + 1, // hijri-converter uses 1-based months
    date.getDate()
  );

  return formatHijriDate(hijriDate);
}

/**
 * Convert a Hijri date to Gregorian date
 */
export function hijriToGregorian(year: number, month: number, day: number): Date {
  const gregorianDate = toGregorian(year, month, day);
  return new Date(gregorianDate.gy, gregorianDate.gm - 1, gregorianDate.gd);
}

/**
 * Format Hijri date in Arabic
 * Example: "15 رمضان 1446 هـ"
 */
export function formatHijriDate(hijriDate: HijriDate): string {
  const monthNames = [
    'محرم',
    'صفر',
    'ربيع الأول',
    'ربيع الثاني',
    'جمادى الأولى',
    'جمادى الآخرة',
    'رجب',
    'شعبان',
    'رمضان',
    'شوال',
    'ذو القعدة',
    'ذو الحجة',
  ];

  const monthName = monthNames[hijriDate.hm - 1];
  return `${hijriDate.hd} ${monthName} ${hijriDate.hy} هـ`;
}

/**
 * Format Hijri date in English
 * Example: "15 Ramadan 1446 AH"
 */
export function formatHijriDateEnglish(hijriDate: HijriDate): string {
  const monthNames = [
    'Muharram',
    'Safar',
    'Rabi\' al-Awwal',
    'Rabi\' al-Thani',
    'Jumada al-Awwal',
    'Jumada al-Thani',
    'Rajab',
    'Sha\'ban',
    'Ramadan',
    'Shawwal',
    'Dhu al-Qi\'dah',
    'Dhu al-Hijjah',
  ];

  const monthName = monthNames[hijriDate.hm - 1];
  return `${hijriDate.hd} ${monthName} ${hijriDate.hy} AH`;
}

/**
 * Get both Gregorian and Hijri dates formatted for official documents
 * Returns object with both formats in Arabic and English
 */
export function getDualDateFormat(date: Date): {
  gregorianArabic: string;
  gregorianEnglish: string;
  hijriArabic: string;
  hijriEnglish: string;
  combined: string; // Combined format for official documents
} {
  const hijriDate = toHijri(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );

  // Format Gregorian dates
  const gregorianArabic = date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const gregorianEnglish = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Format Hijri dates
  const hijriArabic = formatHijriDate(hijriDate);
  const hijriEnglish = formatHijriDateEnglish(hijriDate);

  // Combined format (commonly used in official Omani documents)
  const combined = `${gregorianEnglish} / ${hijriArabic}`;

  return {
    gregorianArabic,
    gregorianEnglish,
    hijriArabic,
    hijriEnglish,
    combined,
  };
}

/**
 * Get current date in both Gregorian and Hijri formats
 */
export function getCurrentDualDate() {
  return getDualDateFormat(new Date());
}

/**
 * Add days to a Hijri date
 * Useful for calculating validity periods
 */
export function addDaysToHijriDate(hijriDate: HijriDate, days: number): HijriDate {
  // Convert to Gregorian, add days, convert back
  const gregorianDate = hijriToGregorian(hijriDate.hy, hijriDate.hm, hijriDate.hd);
  gregorianDate.setDate(gregorianDate.getDate() + days);
  
  return toHijri(
    gregorianDate.getFullYear(),
    gregorianDate.getMonth() + 1,
    gregorianDate.getDate()
  );
}

/**
 * Calculate validity period for official documents
 * Returns expiry date in both formats
 */
export function calculateValidityPeriod(
  issueDate: Date,
  validityDays: number
): {
  expiryDate: Date;
  expiryDateFormatted: string;
  validityStatement: string; // For document text
} {
  const expiryDate = new Date(issueDate);
  expiryDate.setDate(expiryDate.getDate() + validityDays);

  const dualFormat = getDualDateFormat(expiryDate);

  const validityStatement = `This document is valid until ${dualFormat.combined}`;

  return {
    expiryDate,
    expiryDateFormatted: dualFormat.combined,
    validityStatement,
  };
}
