import { describe, it, expect } from "vitest";
import * as db from "./db";

describe("Service Marketplace Serialization", () => {
  it("should return serializable plain objects from listServiceRequests", async () => {
    const results = await db.listServiceRequests({});
    
    // Verify results are plain objects (not Drizzle proxy objects)
    results.forEach((result) => {
      expect(result).toBeTypeOf("object");
      expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
      
      // Verify can be serialized with JSON.stringify (superjson uses this internally)
      expect(() => JSON.stringify(result)).not.toThrow();
    });
  });

  it("should return serializable plain objects from getUserServiceRequests", async () => {
    // Use a test user ID (1 is typically the first user)
    const results = await db.getUserServiceRequests(1);
    
    results.forEach((result) => {
      expect(result).toBeTypeOf("object");
      expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
      expect(() => JSON.stringify(result)).not.toThrow();
      
      // Verify bids are also plain objects
      if (result.bids && result.bids.length > 0) {
        result.bids.forEach((bid: any) => {
          expect(bid).toBeTypeOf("object");
          expect(Object.getPrototypeOf(bid)).toBe(Object.prototype);
        });
      }
    });
  });

  it("should return serializable plain object from getServiceRequest", async () => {
    // First create a test request
    const requests = await db.listServiceRequests({});
    
    if (requests.length > 0) {
      const result = await db.getServiceRequest(requests[0].id);
      
      if (result) {
        expect(result).toBeTypeOf("object");
        expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
        expect(() => JSON.stringify(result)).not.toThrow();
      }
    }
  });

  it("should return serializable plain objects from getRequestBids", async () => {
    const requests = await db.listServiceRequests({});
    
    if (requests.length > 0) {
      const results = await db.getRequestBids(requests[0].id);
      
      results.forEach((result) => {
        expect(result).toBeTypeOf("object");
        expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
        expect(() => JSON.stringify(result)).not.toThrow();
      });
    }
  });

  it("should return serializable plain objects from getOfficeBids", async () => {
    // Use a test office ID (1 is typically the first office)
    const results = await db.getOfficeBids(1);
    
    results.forEach((result) => {
      expect(result).toBeTypeOf("object");
      expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
      expect(() => JSON.stringify(result)).not.toThrow();
    });
  });
});
