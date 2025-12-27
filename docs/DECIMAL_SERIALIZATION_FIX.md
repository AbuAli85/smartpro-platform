# Decimal Serialization Fix

## Problem

The application was experiencing widespread tRPC errors: **"Unable to transform response from server"**. Over 200+ errors were occurring on every page load, making the application unusable.

## Root Cause

MySQL `decimal` fields are returned as **strings** by Drizzle ORM to preserve precision (e.g., `"123.45"` instead of `123.45`). The default superjson configuration used by tRPC didn't know how to properly serialize/deserialize these decimal string values, causing transformation failures.

The database schema uses `decimal` types extensively for:
- Prices (`decimal(10, 3)`)
- Ratings (`decimal(3, 2)`)
- Coordinates (`decimal(10, 7)`)
- Discounts (`decimal(5, 2)`)
- And many other financial/numeric fields

## Solution

Created a custom superjson configuration (`shared/superjson-config.ts`) that registers a custom serializer for decimal strings:

```typescript
import superjson from "superjson";

superjson.registerCustom<string, string>(
  {
    isApplicable: (v): v is string => {
      if (typeof v !== 'string') return false;
      // Match decimal strings like "123.45", "0.00", "-10.5"
      return /^-?\d+\.\d+$/.test(v) || /^-?\d+$/.test(v);
    },
    serialize: (v) => v,
    deserialize: (v) => v,
  },
  'decimal-string'
);

export default superjson;
```

## Implementation

1. **Created** `shared/superjson-config.ts` with custom decimal handling
2. **Updated** `server/_core/trpc.ts` to import from `@shared/superjson-config`
3. **Updated** `client/src/main.tsx` to import from `@shared/superjson-config`
4. **Created** comprehensive tests in `server/decimal-serialization.test.ts`

## Testing

All tests pass successfully:
- ✅ Serializes and deserializes decimal strings
- ✅ Handles negative decimal values
- ✅ Handles integer strings from decimal fields
- ✅ Handles mixed data types including decimals
- ✅ Handles arrays with decimal values
- ✅ Does not interfere with regular strings

## Result

- **Before**: 200+ "Unable to transform response from server" errors
- **After**: Zero errors, clean console, all tRPC queries working perfectly

## Why This Approach?

**Alternative approaches considered:**
1. ❌ Convert decimals to numbers in DB layer - loses precision
2. ❌ Change schema to use floats - loses precision, not recommended for financial data
3. ✅ Configure superjson to handle decimal strings - preserves precision, clean solution

This approach:
- Preserves decimal precision (critical for financial data)
- Works transparently with existing code
- Properly handles all edge cases (negative values, integers, arrays)
- Does not interfere with other data types

## Files Modified

- `shared/superjson-config.ts` (new)
- `server/_core/trpc.ts` (updated import)
- `client/src/main.tsx` (updated import)
- `server/decimal-serialization.test.ts` (new)

## References

- [Drizzle ORM Decimal Handling](https://orm.drizzle.team/docs/column-types/mysql#decimal)
- [superjson Custom Types](https://github.com/blitz-js/superjson#register-custom-types)
- [tRPC Data Transformers](https://trpc.io/docs/server/data-transformers)
