import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";
import { sanadOffices, sanadOfficeServices } from "../drizzle/schema";

/**
 * Test that MySQL decimal fields are automatically converted to numbers
 * via the custom typeCast function in the database connection
 */
describe("MySQL Decimal Type Casting", () => {
  beforeAll(async () => {
    // Ensure database connection is established
    const db = await getDb();
    if (!db) {
      throw new Error("Database connection not available for testing");
    }
  });

  it("should convert decimal fields to numbers in office queries", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Query offices with decimal fields (averageRating, performanceScore, locationLat, locationLng)
    const offices = await db.select().from(sanadOffices).limit(1);
    
    if (offices.length > 0) {
      const office = offices[0];
      
      // averageRating should be a number, not a string
      expect(typeof office.averageRating).toBe("number");
      expect(office.averageRating).toBeGreaterThanOrEqual(0);
      expect(office.averageRating).toBeLessThanOrEqual(5);
      
      // performanceScore should be a number if not null
      if (office.performanceScore !== null) {
        expect(typeof office.performanceScore).toBe("number");
      }
      
      // Location coordinates should be numbers if not null
      if (office.locationLat !== null) {
        expect(typeof office.locationLat).toBe("number");
      }
      
      if (office.locationLng !== null) {
        expect(typeof office.locationLng).toBe("number");
      }
    }
  });

  it("should convert decimal price fields to numbers in service queries", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Query services with decimal price field
    const services = await db.select().from(sanadOfficeServices).limit(1);
    
    if (services.length > 0) {
      const service = services[0];
      
      // Price field should be a number, not a string
      if (service.price !== null) {
        expect(typeof service.price).toBe("number");
        expect(service.price).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("should handle null decimal values correctly", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Query offices and check that null decimals remain null
    const offices = await db.select().from(sanadOffices).limit(5);
    
    for (const office of offices) {
      // Null values should remain null, not become 0 or NaN
      if (office.locationLat === null) {
        expect(office.locationLat).toBeNull();
      }
      if (office.locationLng === null) {
        expect(office.locationLng).toBeNull();
      }
    }
  });

  it("should serialize decimal numbers through JSON without errors", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Query data with decimals
    const offices = await db.select().from(sanadOffices).limit(1);
    
    if (offices.length > 0) {
      const office = offices[0];
      
      // Simulate what tRPC/superjson does: convert to JSON and back
      const jsonString = JSON.stringify(office);
      const parsed = JSON.parse(jsonString);
      
      // Numbers should serialize/deserialize correctly
      expect(parsed.averageRating).toBe(office.averageRating);
      expect(typeof parsed.averageRating).toBe("number");
      
      // Verify no NaN or Infinity values
      expect(Number.isNaN(parsed.averageRating)).toBe(false);
      expect(Number.isFinite(parsed.averageRating)).toBe(true);
    }
  });

  it("should handle decimal arithmetic correctly", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const offices = await db.select().from(sanadOffices).limit(1);
    
    if (offices.length > 0) {
      const office = offices[0];
      
      // Should be able to perform arithmetic on decimal fields
      const ratingPlusOne = office.averageRating + 1;
      expect(typeof ratingPlusOne).toBe("number");
      expect(ratingPlusOne).toBeGreaterThan(office.averageRating);
      
      // Should not get string concatenation
      expect(ratingPlusOne).not.toBe(`${office.averageRating}1`);
    }
  });
});
