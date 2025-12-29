# Arabic Number Formatting - Usage Guide

## Overview

The SmartPro platform now includes comprehensive Arabic number formatting utilities that automatically convert Western numerals (0-9) to Arabic-Indic numerals (٠-٩) when the user's language is set to Arabic.

## Quick Start

### Using the React Hook (Recommended)

```tsx
import { useArabicNumbers } from '@/hooks/useArabicNumbers';

function MyComponent() {
  const { formatNumber, formatCurrency, formatDate, isArabic } = useArabicNumbers();

  return (
    <div>
      {/* Automatically uses Arabic numerals in Arabic mode */}
      <p>Price: {formatCurrency(150.500)}</p>
      {/* Output in Arabic: ١٥٠.٥٠٠ ر.ع. */}
      {/* Output in English: 150.500 OMR */}
      
      <p>Total: {formatNumber(1234567, { useThousandsSeparator: true })}</p>
      {/* Output in Arabic: ١،٢٣٤،٥٦٧ */}
      {/* Output in English: 1,234,567 */}
    </div>
  );
}
```

### Direct Utility Functions

```typescript
import { 
  toArabicNumerals,
  formatArabicNumber,
  formatArabicCurrency,
  formatArabicDate 
} from '@/lib/arabicNumbers';

// Convert any number to Arabic numerals
toArabicNumerals(123);  // "١٢٣"
toArabicNumerals("2024");  // "٢٠٢٤"

// Format numbers with separators
formatArabicNumber(1000, { useThousandsSeparator: true });  // "١،٠٠٠"

// Format currency
formatArabicCurrency(250.500);  // "٢٥٠.٥٠٠ ر.ع."

// Format dates
formatArabicDate(new Date(), { format: 'long' });  // "٢٨ ديسمبر ٢٠٢٥"
```

## Available Functions

### Hook Methods

#### `formatNumber(value, options?)`
Format a number with proper separators and Arabic numerals.

```tsx
formatNumber(1234.56, { decimals: 2, useThousandsSeparator: true })
// Arabic: "١،٢٣٤.٥٦"
// English: "1,234.56"
```

#### `formatCurrency(amount, options?)`
Format currency in Omani Rials.

```tsx
formatCurrency(100.500, { showCurrencyCode: true, decimals: 3 })
// Arabic: "١٠٠.٥٠٠ ر.ع."
// English: "100.500 OMR"
```

#### `formatDate(date, options?)`
Format dates with Arabic numerals and month names.

```tsx
formatDate(new Date(), { format: 'long', includeTime: false })
// Arabic: "٢٨ ديسمبر ٢٠٢٥"
// English: "December 28, 2025"
```

#### `formatPhone(phoneNumber)`
Format phone numbers with Arabic numerals.

```tsx
formatPhone("96812345678")
// Arabic: "+٩٦٨ ١٢٣٤ ٥٦٧٨"
// English: "+968 1234 5678"
```

#### `formatPercentage(value, options?)`
Format percentages with Arabic numerals.

```tsx
formatPercentage(85.5, { decimals: 1 })
// Arabic: "٨٥.٥٪"
// English: "85.5%"
```

#### `formatCompact(value)`
Format large numbers in compact form (K, M).

```tsx
formatCompact(1500)
// Arabic: "١.٥ك"
// English: "1.5K"

formatCompact(2500000)
// Arabic: "٢.٥م"
// English: "2.5M"
```

## Implementation Examples

### Homepage Statistics

```tsx
import { useArabicNumbers } from '@/hooks/useArabicNumbers';

function StatsSection() {
  const { formatCompact, formatNumber } = useArabicNumbers();

  return (
    <div className="stats">
      <div className="stat">
        <span className="value">{formatCompact(500)}+</span>
        <span className="label">Verified Offices</span>
      </div>
      <div className="stat">
        <span className="value">{formatCompact(10000)}+</span>
        <span className="label">Completed Services</span>
      </div>
      <div className="stat">
        <span className="value">{formatNumber(4.9, { decimals: 1 })}★</span>
        <span className="label">Average Rating</span>
      </div>
    </div>
  );
}
```

### Office Card with Price

```tsx
import { useArabicNumbers } from '@/hooks/useArabicNumbers';

function OfficeCard({ office }) {
  const { formatCurrency } = useArabicNumbers();

  return (
    <div className="office-card">
      <h3>{office.name}</h3>
      <p className="price">
        Starting from {formatCurrency(office.minPrice)}
      </p>
    </div>
  );
}
```

### Booking Date Display

```tsx
import { useArabicNumbers } from '@/hooks/useArabicNumbers';

function BookingDetails({ booking }) {
  const { formatDate, formatCurrency } = useArabicNumbers();

  return (
    <div>
      <p>Date: {formatDate(booking.date, { format: 'long' })}</p>
      <p>Total: {formatCurrency(booking.total)}</p>
    </div>
  );
}
```

## Best Practices

1. **Always use the hook in React components** - It automatically detects the current language
2. **Use formatCurrency for all monetary values** - Ensures consistent OMR formatting
3. **Use formatDate for all dates** - Provides proper Arabic month names and numerals
4. **Use formatCompact for large statistics** - Makes numbers more readable (500K vs 500,000)
5. **Test in both languages** - Switch between English and Arabic to verify formatting

## Arabic Numeral Reference

| Western | Arabic-Indic |
|---------|--------------|
| 0       | ٠            |
| 1       | ١            |
| 2       | ٢            |
| 3       | ٣            |
| 4       | ٤            |
| 5       | ٥            |
| 6       | ٦            |
| 7       | ٧            |
| 8       | ٨            |
| 9       | ٩            |

## Currency Symbol

- **OMR in Arabic**: ر.ع. (Rial Omani)
- **OMR in English**: OMR

## Date Formatting

### Arabic Month Names
يناير، فبراير، مارس، أبريل، مايو، يونيو، يوليو، أغسطس، سبتمبر، أكتوبر، نوفمبر، ديسمبر

### Format Options
- **short**: ٢٨/١٢/٢٠٢٥
- **medium**: ٢٨-١٢-٢٠٢٥
- **long**: ٢٨ ديسمبر ٢٠٢٥

## Next Steps

To apply Arabic number formatting throughout the platform:

1. **Homepage**: Update statistics section (500+, 10K+, 4.9★)
2. **Office Cards**: Format prices and ratings
3. **Booking Pages**: Format dates, times, and prices
4. **Analytics**: Format all charts and metrics
5. **Admin Dashboard**: Format all numerical data

## Testing

```tsx
// Test in both languages
const { formatNumber, formatCurrency } = useArabicNumbers();

console.log(formatNumber(1234));  // Check output
console.log(formatCurrency(100)); // Check output

// Switch language and test again
i18n.changeLanguage('ar');
console.log(formatNumber(1234));  // Should show Arabic numerals
```
