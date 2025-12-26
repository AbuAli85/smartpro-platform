/**
 * Internationalization helpers for dynamic content translation
 */

export type Language = "en" | "ar";

/**
 * Get localized field value based on language preference
 * Falls back to English if Arabic translation is not available
 */
export function getLocalizedField<T extends Record<string, any>>(
  obj: T,
  fieldName: string,
  language: Language
): string {
  if (language === "ar") {
    const arField = `${fieldName}Ar`;
    if (arField in obj && obj[arField]) {
      return obj[arField];
    }
  }
  return obj[fieldName] || "";
}

/**
 * Transform an object to include localized fields based on language
 * Replaces base fields with their localized versions
 */
export function localizeObject<T extends Record<string, any>>(
  obj: T,
  language: Language,
  fields: string[]
): T {
  if (language === "en") {
    return obj;
  }

  const localized = { ...obj } as any;
  
  for (const field of fields) {
    const arField = `${field}Ar`;
    if (arField in obj && obj[arField]) {
      localized[field] = obj[arField];
    }
  }

  return localized as T;
}

/**
 * Transform an array of objects to include localized fields
 */
export function localizeArray<T extends Record<string, any>>(
  array: T[],
  language: Language,
  fields: string[]
): T[] {
  if (language === "en") {
    return array;
  }

  return array.map(obj => localizeObject(obj, language, fields));
}

/**
 * Get language from Accept-Language header or default to English
 */
export function getLanguageFromHeader(acceptLanguage?: string): Language {
  if (!acceptLanguage) {
    return "en";
  }

  // Parse Accept-Language header (e.g., "ar,en-US;q=0.9,en;q=0.8")
  const languages = acceptLanguage
    .split(",")
    .map(lang => {
      const [code, qValue] = lang.trim().split(";");
      const quality = qValue ? parseFloat(qValue.split("=")[1]) : 1.0;
      return { code: code.split("-")[0].toLowerCase(), quality };
    })
    .sort((a, b) => b.quality - a.quality);

  // Check if Arabic is preferred
  if (languages[0]?.code === "ar") {
    return "ar";
  }

  return "en";
}
