// Form validation utilities

export const validators = {
  required: (value: any) => {
    if (value === null || value === undefined || value === "") {
      return "This field is required";
    }
    return null;
  },

  email: (value: string) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address";
    }
    return null;
  },

  phone: (value: string) => {
    if (!value) return null;
    // Oman phone number format: +968 XXXXXXXX or 968XXXXXXXX or XXXXXXXX
    const phoneRegex = /^(\+?968)?[79]\d{7}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ""))) {
      return "Please enter a valid Oman phone number";
    }
    return null;
  },

  minLength: (min: number) => (value: string) => {
    if (!value) return null;
    if (value.length < min) {
      return `Must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (max: number) => (value: string) => {
    if (!value) return null;
    if (value.length > max) {
      return `Must be no more than ${max} characters`;
    }
    return null;
  },

  min: (min: number) => (value: number) => {
    if (value === null || value === undefined) return null;
    if (value < min) {
      return `Must be at least ${min}`;
    }
    return null;
  },

  max: (max: number) => (value: number) => {
    if (value === null || value === undefined) return null;
    if (value > max) {
      return `Must be no more than ${max}`;
    }
    return null;
  },

  url: (value: string) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return "Please enter a valid URL";
    }
  },

  fileSize: (maxSizeMB: number) => (file: File) => {
    if (!file) return null;
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `File size must be less than ${maxSizeMB}MB`;
    }
    return null;
  },

  fileType: (allowedTypes: string[]) => (file: File) => {
    if (!file) return null;
    if (!allowedTypes.includes(file.type)) {
      return `File type must be one of: ${allowedTypes.join(", ")}`;
    }
    return null;
  },

  commercialRegistration: (value: string) => {
    if (!value) return null;
    // Oman CR format: 7-8 digits
    const crRegex = /^\d{7,8}$/;
    if (!crRegex.test(value)) {
      return "Please enter a valid commercial registration number";
    }
    return null;
  },

  taxNumber: (value: string) => {
    if (!value) return null;
    // Oman tax number format: OM + 10 digits
    const taxRegex = /^OM\d{10}$/;
    if (!taxRegex.test(value)) {
      return "Please enter a valid tax number (OM + 10 digits)";
    }
    return null;
  },
};

// Compose multiple validators
export function composeValidators(...validators: Array<(value: any) => string | null>) {
  return (value: any) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return null;
  };
}

// Validate an entire form object
export function validateForm<T extends Record<string, any>>(
  values: T,
  rules: Partial<Record<keyof T, (value: any) => string | null>>
): Partial<Record<keyof T, string>> {
  const errors: Partial<Record<keyof T, string>> = {};
  
  for (const field in rules) {
    const validator = rules[field];
    if (validator) {
      const error = validator(values[field]);
      if (error) {
        errors[field] = error;
      }
    }
  }
  
  return errors;
}

// Format phone number for display
export function formatPhoneNumber(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  
  // If starts with 968, format as +968 XXXX XXXX
  if (cleaned.startsWith("968")) {
    const number = cleaned.slice(3);
    return `+968 ${number.slice(0, 4)} ${number.slice(4)}`;
  }
  
  // Otherwise format as XXXX XXXX
  return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
}

// Format currency for display
export function formatCurrency(amount: number, currency: string = "OMR"): string {
  return new Intl.NumberFormat("en-OM", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

// Format date for display
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-OM", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

// Format datetime for display
export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-OM", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
