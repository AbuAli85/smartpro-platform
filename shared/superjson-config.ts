import superjson from "superjson";

/**
 * Configure superjson to handle MySQL decimal types
 * MySQL decimals are returned as strings to preserve precision
 */

// Register a custom serializer for decimal strings
superjson.registerCustom<string, string>(
  {
    isApplicable: (v): v is string => {
      // Check if it's a string that looks like a decimal number
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
