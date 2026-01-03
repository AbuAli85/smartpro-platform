import geoip from "geoip-lite";

/**
 * IP Geolocation Service
 * 
 * Uses geoip-lite for fast, offline IP geolocation lookups.
 * Database is automatically updated monthly via the package.
 */

export interface LocationData {
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  formatted?: string;
}

/**
 * Lookup geographic location from IP address
 * 
 * @param ipAddress - IPv4 or IPv6 address
 * @returns Location data or null if not found
 */
export function lookupIPLocation(ipAddress: string | undefined): LocationData | null {
  if (!ipAddress || ipAddress === "::1" || ipAddress === "127.0.0.1") {
    // Localhost - return default location
    return {
      country: "Local",
      region: "Local",
      city: "Localhost",
      latitude: 0,
      longitude: 0,
      timezone: "UTC",
      formatted: "Localhost",
    };
  }

  try {
    const geo = geoip.lookup(ipAddress);
    
    if (!geo) {
      console.log(`[IP Geolocation] No location found for IP: ${ipAddress}`);
      return null;
    }

    // Format location string
    const locationParts: string[] = [];
    if (geo.city) locationParts.push(geo.city);
    if (geo.region) locationParts.push(geo.region);
    if (geo.country) locationParts.push(geo.country);
    const formatted = locationParts.join(", ") || "Unknown Location";

    return {
      country: geo.country || undefined,
      region: geo.region || undefined,
      city: geo.city || undefined,
      latitude: geo.ll?.[0],
      longitude: geo.ll?.[1],
      timezone: geo.timezone || undefined,
      formatted,
    };
  } catch (error) {
    console.error(`[IP Geolocation] Error looking up IP ${ipAddress}:`, error);
    return null;
  }
}

/**
 * Calculate distance between two geographic coordinates (in kilometers)
 * Uses Haversine formula
 * 
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Detect suspicious login based on location change
 * 
 * @param previousLocation - Previous login location
 * @param currentLocation - Current login location
 * @param timeDifferenceMinutes - Time between logins in minutes
 * @returns Whether the login is suspicious
 */
export function isSuspiciousLocationChange(
  previousLocation: LocationData | null,
  currentLocation: LocationData | null,
  timeDifferenceMinutes: number
): { suspicious: boolean; reason?: string } {
  // If we don't have location data, can't determine
  if (!previousLocation || !currentLocation) {
    return { suspicious: false };
  }

  // If locations are the same country, not suspicious
  if (previousLocation.country === currentLocation.country) {
    return { suspicious: false };
  }

  // If we have coordinates, calculate distance
  if (
    previousLocation.latitude !== undefined &&
    previousLocation.longitude !== undefined &&
    currentLocation.latitude !== undefined &&
    currentLocation.longitude !== undefined
  ) {
    const distance = calculateDistance(
      previousLocation.latitude,
      previousLocation.longitude,
      currentLocation.latitude,
      currentLocation.longitude
    );

    // Impossible travel: > 500 km in less than 1 hour
    if (distance > 500 && timeDifferenceMinutes < 60) {
      return {
        suspicious: true,
        reason: `Impossible travel: ${Math.round(distance)}km in ${timeDifferenceMinutes} minutes`,
      };
    }

    // Very fast travel: > 1000 km in less than 2 hours
    if (distance > 1000 && timeDifferenceMinutes < 120) {
      return {
        suspicious: true,
        reason: `Very fast travel: ${Math.round(distance)}km in ${timeDifferenceMinutes} minutes`,
      };
    }
  }

  // Different country but reasonable time - flag as potentially suspicious
  if (timeDifferenceMinutes < 360) {
    // Less than 6 hours
    return {
      suspicious: true,
      reason: `Country change from ${previousLocation.country} to ${currentLocation.country} in ${timeDifferenceMinutes} minutes`,
    };
  }

  return { suspicious: false };
}
