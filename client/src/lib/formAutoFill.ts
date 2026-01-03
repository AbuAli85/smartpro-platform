/**
 * Form Auto-Fill Service
 * Manages persistent form data for smart auto-completion
 */

export interface UserFormData {
  // Personal Information
  fullName?: string;
  email?: string;
  phone?: string;
  
  // Address Information
  governorate?: string;
  wilayat?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  
  // Business Information
  companyName?: string;
  commercialRegistration?: string;
  taxRegistration?: string;
  
  // Preferences
  preferredContactMethod?: "email" | "phone" | "whatsapp";
  
  // Metadata
  lastUpdated?: string;
  autoFillEnabled?: boolean;
}

const STORAGE_KEY = "smartpro_form_autofill";

/**
 * Load saved form data from localStorage
 */
export function loadFormData(): UserFormData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { autoFillEnabled: true };
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error("[FormAutoFill] Error loading data:", error);
    return { autoFillEnabled: true };
  }
}

/**
 * Save form data to localStorage
 */
export function saveFormData(data: Partial<UserFormData>): void {
  try {
    const existing = loadFormData();
    const updated: UserFormData = {
      ...existing,
      ...data,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("[FormAutoFill] Error saving data:", error);
  }
}

/**
 * Clear all saved form data
 */
export function clearFormData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("[FormAutoFill] Error clearing data:", error);
  }
}

/**
 * Check if auto-fill is enabled
 */
export function isAutoFillEnabled(): boolean {
  const data = loadFormData();
  return data.autoFillEnabled !== false;
}

/**
 * Enable or disable auto-fill
 */
export function setAutoFillEnabled(enabled: boolean): void {
  saveFormData({ autoFillEnabled: enabled });
}

/**
 * Extract form data from form values
 */
export function extractFormData(formValues: Record<string, any>): Partial<UserFormData> {
  const extracted: Partial<UserFormData> = {};
  
  // Map common field names to UserFormData fields
  const fieldMapping: Record<string, keyof UserFormData> = {
    fullName: "fullName",
    name: "fullName",
    customerName: "fullName",
    email: "email",
    phone: "phone",
    phoneNumber: "phone",
    mobile: "phone",
    governorate: "governorate",
    wilayat: "wilayat",
    addressLine1: "addressLine1",
    address: "addressLine1",
    addressLine2: "addressLine2",
    postalCode: "postalCode",
    companyName: "companyName",
    company: "companyName",
    officeName: "companyName",
    commercialRegistration: "commercialRegistration",
    crNumber: "commercialRegistration",
    taxRegistration: "taxRegistration",
    taxNumber: "taxRegistration",
    preferredContactMethod: "preferredContactMethod",
    contactMethod: "preferredContactMethod",
  };
  
  for (const [formField, value] of Object.entries(formValues)) {
    const dataField = fieldMapping[formField] as keyof UserFormData | undefined;
    if (dataField && value && typeof value === "string" && value.trim()) {
      (extracted as any)[dataField] = value.trim();
    }
  }
  
  return extracted;
}

/**
 * Auto-fill form with saved data
 */
export function autoFillForm(formFields: string[]): Partial<Record<string, string>> {
  if (!isAutoFillEnabled()) {
    return {};
  }
  
  const savedData = loadFormData();
  const filled: Record<string, string> = {};
  
  // Reverse mapping from UserFormData to common form field names
  const reverseMapping: Partial<Record<keyof UserFormData, string[]>> = {
    fullName: ["fullName", "name", "customerName"],
    email: ["email"],
    phone: ["phone", "phoneNumber", "mobile"],
    governorate: ["governorate"],
    wilayat: ["wilayat"],
    addressLine1: ["addressLine1", "address"],
    addressLine2: ["addressLine2"],
    postalCode: ["postalCode"],
    companyName: ["companyName", "company", "officeName"],
    commercialRegistration: ["commercialRegistration", "crNumber"],
    taxRegistration: ["taxRegistration", "taxNumber"],
    preferredContactMethod: ["preferredContactMethod", "contactMethod"],
  };
  
  for (const field of formFields) {
    for (const [dataKey, formNames] of Object.entries(reverseMapping)) {
      if (formNames.includes(field)) {
        const value = savedData[dataKey as keyof UserFormData];
        if (value) {
          filled[field] = value as string;
        }
      }
    }
  }
  
  return filled;
}

/**
 * Get autocomplete attribute for a field
 */
export function getAutocompleteAttribute(fieldName: string): string {
  const autocompleteMap: Record<string, string> = {
    // Personal
    fullName: "name",
    firstName: "given-name",
    lastName: "family-name",
    email: "email",
    phone: "tel",
    phoneNumber: "tel",
    mobile: "tel",
    
    // Address
    addressLine1: "address-line1",
    address: "address-line1",
    addressLine2: "address-line2",
    city: "address-level2",
    wilayat: "address-level2",
    governorate: "address-level1",
    postalCode: "postal-code",
    country: "country-name",
    
    // Organization
    companyName: "organization",
    company: "organization",
    officeName: "organization",
    
    // Other
    username: "username",
    password: "current-password",
    newPassword: "new-password",
  };
  
  return autocompleteMap[fieldName] || "off";
}

/**
 * React hook for form auto-fill
 */
export function useFormAutoFill<T extends Record<string, any>>(
  formFields: (keyof T)[],
  initialValues?: Partial<T>
): {
  autoFilledValues: Partial<T>;
  saveFormValues: (values: T) => void;
  clearSavedData: () => void;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
} {
  const fieldNames = formFields.map(f => String(f));
  const autoFilledData = autoFillForm(fieldNames);
  
  // Merge with initial values (initial values take precedence)
  const autoFilledValues: Partial<T> = {
    ...autoFilledData,
    ...initialValues,
  } as Partial<T>;
  
  const saveFormValues = (values: T) => {
    const extracted = extractFormData(values as Record<string, any>);
    saveFormData(extracted);
  };
  
  const clearSavedData = () => {
    clearFormData();
  };
  
  const isEnabled = isAutoFillEnabled();
  
  const setEnabled = (enabled: boolean) => {
    setAutoFillEnabled(enabled);
  };
  
  return {
    autoFilledValues,
    saveFormValues,
    clearSavedData,
    isEnabled,
    setEnabled,
  };
}
