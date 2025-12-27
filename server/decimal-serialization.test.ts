import { describe, it, expect } from "vitest";
import superjson from "@shared/superjson-config";

/**
 * Test that superjson properly handles MySQL decimal types
 * MySQL returns decimal values as strings to preserve precision
 */
describe("Decimal Serialization", () => {
  it("should serialize and deserialize decimal strings", () => {
    const testData = {
      price: "123.45",
      rating: "4.50",
      discount: "15.00",
      latitude: "23.5880339",
      longitude: "58.3828717",
    };

    const serialized = superjson.stringify(testData);
    const deserialized = superjson.parse(serialized);

    expect(deserialized).toEqual(testData);
    expect(deserialized.price).toBe("123.45");
    expect(deserialized.rating).toBe("4.50");
  });

  it("should handle negative decimal values", () => {
    const testData = {
      balance: "-100.50",
      adjustment: "-25.75",
    };

    const serialized = superjson.stringify(testData);
    const deserialized = superjson.parse(serialized);

    expect(deserialized).toEqual(testData);
    expect(deserialized.balance).toBe("-100.50");
  });

  it("should handle integer strings from decimal fields", () => {
    const testData = {
      count: "100",
      total: "0",
    };

    const serialized = superjson.stringify(testData);
    const deserialized = superjson.parse(serialized);

    expect(deserialized).toEqual(testData);
  });

  it("should handle mixed data types including decimals", () => {
    const testData = {
      id: 123,
      name: "Test Office",
      price: "99.99",
      active: true,
      rating: "4.75",
      createdAt: new Date("2024-01-01"),
    };

    const serialized = superjson.stringify(testData);
    const deserialized = superjson.parse(serialized);

    expect(deserialized.id).toBe(123);
    expect(deserialized.name).toBe("Test Office");
    expect(deserialized.price).toBe("99.99");
    expect(deserialized.active).toBe(true);
    expect(deserialized.rating).toBe("4.75");
    expect(deserialized.createdAt).toEqual(new Date("2024-01-01"));
  });

  it("should handle arrays with decimal values", () => {
    const testData = {
      offices: [
        { id: 1, rating: "4.50", price: "100.00" },
        { id: 2, rating: "4.75", price: "150.50" },
      ],
    };

    const serialized = superjson.stringify(testData);
    const deserialized = superjson.parse(serialized);

    expect(deserialized).toEqual(testData);
    expect(deserialized.offices[0].rating).toBe("4.50");
    expect(deserialized.offices[1].price).toBe("150.50");
  });

  it("should not interfere with regular strings", () => {
    const testData = {
      name: "Test Office",
      description: "This is a test",
      code: "ABC123",
      email: "test@example.com",
    };

    const serialized = superjson.stringify(testData);
    const deserialized = superjson.parse(serialized);

    expect(deserialized).toEqual(testData);
  });
});
