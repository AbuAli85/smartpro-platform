# Arabic Numerals & RTL Implementation Guide

## 📚 Overview

This guide provides comprehensive instructions for implementing Arabic numeral formatting and RTL (Right-to-Left) support across the SmartPro platform.

---

## 🎯 Quick Start

### 1. Import the Hook

```tsx
import { useFormatNumber } from '@/hooks/useFormatNumber';
```

### 2. Use in Your Component

```tsx
export default function MyComponent() {
  const { formatNumber, formatCurrency, formatPercent } = useFormatNumber();
  
  return (
    <div>
      <p>Total: {formatNumber(1234)}</p>
      <p>Price: {formatCurrency(99.500)}</p>
      <p>Growth: {formatPercent(15.5)}</p>
    </div>
  );
}
```

**Result in Arabic mode:**
- Total: ١٬٢٣٤
- Price: ٩٩٫٥٠٠ ر.ع.
- Growth: ١٥٫٥٪

---

## 🔧 Available Functions

### `formatNumber(value, options?)`
Format any number with locale-aware separators.

```tsx
formatNumber(1234567)           // English: 1,234,567 | Arabic: ١٬٢٣٤٬٥٦٧
formatNumber(3.14159, { maximumFractionDigits: 2 })  // 3.14 | ٣٫١٤
```

### `formatCurrency(value, currency?)`
Format currency values (default: OMR).

```tsx
formatCurrency(99.500)          // English: OMR 99.50 | Arabic: ٩٩٫٥٠ ر.ع.
formatCurrency(1234.56, 'USD')  // English: $1,234.56 | Arabic: US$ ١٬٢٣٤٫٥٦
```

### `formatPercent(value, decimals?)`
Format percentage values.

```tsx
formatPercent(15.5)             // English: 15.5% | Arabic: ١٥٫٥٪
formatPercent(99.999, 2)        // English: 100.00% | Arabic: ١٠٠٫٠٠٪
```

### `formatDate(date, options?)`
Format dates with locale-aware formatting.

```tsx
formatDate(new Date())          // English: January 1, 2026 | Arabic: ١ يناير ٢٠٢٦
formatDate(date, { dateStyle: 'short' })  // 1/1/2026 | ١‏/١‏/٢٠٢٦
```

### `formatTime(date, options?)`
Format time values.

```tsx
formatTime(new Date())          // English: 02:30 PM | Arabic: ٠٢:٣٠ م
```

### `formatDateTime(date, options?)`
Format date and time together.

```tsx
formatDateTime(new Date())      // English: Jan 1, 2026, 02:30 PM | Arabic: ١ يناير ٢٠٢٦، ٠٢:٣٠ م
```

### `formatCompactNumber(value)`
Format large numbers in compact form.

```tsx
formatCompactNumber(1500)       // English: 1.5K | Arabic: ١٫٥ ألف
formatCompactNumber(1000000)    // English: 1M | Arabic: ١ مليون
```

### `formatPhoneNumber(phone)`
Format phone numbers with Arabic numerals.

```tsx
formatPhoneNumber('+968 9123 4567')  // English: +968 9123 4567 | Arabic: +٩٦٨ ٩١٢٣ ٤٥٦٧
```

### `formatId(id, prefix?)`
Format IDs and reference numbers.

```tsx
formatId(12345)                 // English: 12345 | Arabic: ١٢٣٤٥
formatId(12345, '#')            // English: #12345 | Arabic: #١٢٣٤٥
```

### `toArabicNumerals(value)`
Convert any string/number to Arabic numerals directly.

```tsx
toArabicNumerals('Order #12345')  // Order #١٢٣٤٥
toArabicNumerals(2026)            // ٢٠٢٦
```

---

## 📋 Implementation Examples

### Example 1: Dashboard Statistics Card

```tsx
import { useFormatNumber } from '@/hooks/useFormatNumber';

export function StatsCard({ title, value, change }) {
  const { formatNumber, formatPercent } = useFormatNumber();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {formatNumber(value)}
        </div>
        <p className="text-sm text-muted-foreground">
          {change >= 0 ? '+' : ''}{formatPercent(change)} from last month
        </p>
      </CardContent>
    </Card>
  );
}
```

### Example 2: Booking List with Prices

```tsx
import { useFormatNumber } from '@/hooks/useFormatNumber';

export function BookingsList({ bookings }) {
  const { formatCurrency, formatDate, formatId } = useFormatNumber();
  
  return (
    <Table>
      <TableBody>
        {bookings.map((booking) => (
          <TableRow key={booking.id}>
            <TableCell>{formatId(booking.id, '#')}</TableCell>
            <TableCell>{formatDate(booking.date)}</TableCell>
            <TableCell>{formatCurrency(booking.price)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Example 3: Analytics Chart with Formatted Tooltips

```tsx
import { useFormatNumber } from '@/hooks/useFormatNumber';
import { Line } from 'react-chartjs-2';

export function RevenueChart({ data }) {
  const { formatCurrency, formatDate } = useFormatNumber();
  
  const chartOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => formatCurrency(context.parsed.y),
          title: (context) => formatDate(context[0].label),
        },
      },
    },
  };
  
  return <Line data={data} options={chartOptions} />;
}
```

### Example 4: User Profile with Points

```tsx
import { useFormatNumber } from '@/hooks/useFormatNumber';

export function UserProfile({ user }) {
  const { formatNumber, formatCompactNumber, formatPhoneNumber } = useFormatNumber();
  
  return (
    <div>
      <h2>{user.name}</h2>
      <p>Phone: {formatPhoneNumber(user.phone)}</p>
      <p>Loyalty Points: {formatNumber(user.points)}</p>
      <p>Total Earned: {formatCompactNumber(user.totalEarned)}</p>
    </div>
  );
}
```

---

## ✅ Pages Already Implemented

The following pages have been updated with Arabic numeral formatting:

1. ✅ **Analytics** (`/pages/Analytics.tsx`)
   - Revenue metrics
   - Booking counts
   - Growth percentages

2. ✅ **AdminDashboard** (`/pages/AdminDashboard.tsx`)
   - Total offices, users, documents
   - Booking statistics

3. ✅ **OfficeDashboard** (`/pages/OfficeDashboard.tsx`)
   - Booking counts
   - Completed/cancelled statistics

4. ✅ **LoyaltyDashboard** (`/pages/LoyaltyDashboard.tsx`)
   - Available points
   - Total earned points
   - Points value in currency

---

## 📝 Pages Pending Implementation

The following pages should be updated with Arabic numeral formatting:

### High Priority
- [ ] `BookingsList.tsx` - Booking IDs, dates, prices
- [ ] `BookOffice.tsx` - Prices, time slots, duration
- [ ] `MyServiceRequests.tsx` - Request IDs, budgets, bids
- [ ] `MarketplaceBrowser.tsx` - Budgets, deadlines
- [ ] `ReferFriends.tsx` - Referral counts, bonuses

### Medium Priority
- [ ] `UserManagement.tsx` - User counts, dates
- [ ] `OfficeVerification.tsx` - Office counts
- [ ] `TranslationQuality.tsx` - Completion rates
- [ ] `StaffPerformance.tsx` - Metrics, scores
- [ ] `ChatAnalytics.tsx` - Message counts, response times
- [ ] `BundleAnalytics.tsx` - Prices, savings, revenue

### Low Priority (Components)
- [ ] `TransactionHistory.tsx` - Transaction amounts
- [ ] `InvoiceList.tsx` - Invoice numbers and amounts
- [ ] `ServicePricing.tsx` - Service prices
- [ ] `OfficeRatings.tsx` - Rating scores

---

## 🎨 RTL Dialog Components

All dialog components have been upgraded to use `RTLDialog` for proper RTL animations:

✅ **Completed:**
- OfficePreview
- BookingCalendar
- FileGallery (both gallery and preview dialogs)
- DocumentPreviewModal
- RatingModal
- All other major dialogs

**Usage:**
```tsx
import RTLDialog from '@/components/RTLDialog';

<RTLDialog 
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Dialog Title"
  description="Dialog description"
  mode="slide"  // or "fade"
>
  <div>Dialog content here</div>
</RTLDialog>
```

---

## 🔔 RTL Toast Notifications

Toast notifications automatically adapt to RTL:

✅ **Features:**
- Auto-positioning (top-right → top-left in Arabic)
- RTL text direction
- Proper animation direction
- Works with all 285+ existing toast calls

**No code changes needed** - all existing `toast.success()`, `toast.error()`, etc. calls work automatically!

---

## 🧪 Testing Checklist

When implementing Arabic numerals on a new page:

1. **Switch to Arabic language** in the app
2. **Verify all numbers** display with Arabic numerals (٠-٩)
3. **Check currency formatting** shows OMR symbol correctly
4. **Test percentages** display with Arabic % symbol
5. **Verify dates** use Arabic month names
6. **Check phone numbers** convert to Arabic numerals
7. **Test IDs and references** show Arabic numerals
8. **Verify chart tooltips** format correctly
9. **Check table data** aligns properly in RTL
10. **Test empty states** (0 values) display correctly

---

## 🚀 Migration Strategy

### For New Pages
Always use `useFormatNumber` from the start:

```tsx
import { useFormatNumber } from '@/hooks/useFormatNumber';

export default function NewPage() {
  const { formatNumber, formatCurrency } = useFormatNumber();
  // Use formatting functions throughout
}
```

### For Existing Pages
Follow this pattern:

1. Import the hook
2. Destructure needed functions
3. Replace hardcoded `.toFixed()`, `.toLocaleString()`, etc.
4. Test in both English and Arabic modes

**Before:**
```tsx
<div>{revenue.toFixed(2)} OMR</div>
<div>{count}</div>
<div>{percentage.toFixed(1)}%</div>
```

**After:**
```tsx
const { formatCurrency, formatNumber, formatPercent } = useFormatNumber();

<div>{formatCurrency(revenue)}</div>
<div>{formatNumber(count)}</div>
<div>{formatPercent(percentage)}</div>
```

---

## 📊 Progress Tracking

**Overall Progress:**
- ✅ Core utilities created (11 functions)
- ✅ Hook implemented (`useFormatNumber`)
- ✅ RTL dialogs upgraded (8 components)
- ✅ RTL toast notifications implemented (285 toasts)
- ✅ 4 major pages implemented
- ⏳ 15+ pages pending implementation

**Estimated Coverage:** ~25% of pages completed

---

## 💡 Best Practices

1. **Always use the hook** - Never hardcode number formatting
2. **Destructure only what you need** - Improves code readability
3. **Test in both languages** - Switch between EN/AR frequently
4. **Use semantic function names** - `formatCurrency` not `formatNumber` for money
5. **Handle null/undefined** - All functions handle empty values gracefully
6. **Consistent formatting** - Use same decimal places across similar data
7. **Chart.js integration** - Use formatting in tooltip callbacks
8. **Table alignment** - Numbers auto-align correctly in RTL mode

---

## 🐛 Common Issues & Solutions

### Issue 1: Numbers not converting to Arabic
**Solution:** Ensure you're using the hook, not hardcoded formatting:
```tsx
// ❌ Wrong
<div>{value}</div>

// ✅ Correct
<div>{formatNumber(value)}</div>
```

### Issue 2: Currency symbol in wrong position
**Solution:** Use `formatCurrency()` instead of manual concatenation:
```tsx
// ❌ Wrong
<div>{value} OMR</div>

// ✅ Correct
<div>{formatCurrency(value)}</div>
```

### Issue 3: Percentages showing wrong format
**Solution:** Pass the raw value (not divided by 100):
```tsx
// ❌ Wrong
formatPercent(15.5 / 100)  // Shows 0.155%

// ✅ Correct
formatPercent(15.5)  // Shows 15.5%
```

### Issue 4: Dates showing English in Arabic mode
**Solution:** Use `formatDate()` instead of `toLocaleDateString()`:
```tsx
// ❌ Wrong
new Date().toLocaleDateString()

// ✅ Correct
formatDate(new Date())
```

---

## 📞 Support

For questions or issues:
1. Check this guide first
2. Review implemented pages for examples
3. Test in both English and Arabic modes
4. Consult the team if issues persist

---

**Last Updated:** January 2026  
**Version:** 1.0  
**Maintainer:** SmartPro Development Team
