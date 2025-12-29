import { getDb } from "./db";
import { sanadOffices, bookings, reviews, sanadOfficeServices } from "../drizzle/schema";
import { eq, and, sql, desc, inArray } from "drizzle-orm";

export interface RecommendedOffice {
  id: number;
  officeName: string;
  officeNameAr: string;
  description: string;
  descriptionAr: string;
  governorate: string;
  logoUrl: string | null;
  rating: number;
  reviewCount: number;
  completedBookings: number;
  score: number;
  reason: string;
  reasonAr: string;
}

interface ScoringFactors {
  rating: number;          // 0-5 stars
  reviewCount: number;     // Number of reviews
  completedBookings: number; // Number of completed bookings
  isInUserRegion: boolean; // Whether office is in user's selected region
  hasUserBookedBefore: boolean; // Whether user has booked this office before
}

/**
 * Calculate recommendation score for an office
 * Scoring algorithm:
 * - Rating: 30% weight (0-5 stars normalized to 0-30)
 * - Review count: 20% weight (log scale, capped at 100 reviews)
 * - Completed bookings: 20% weight (log scale, capped at 500 bookings)
 * - Regional match: +15 bonus points
 * - Previous booking: +10 bonus points
 */
function calculateScore(factors: ScoringFactors): number {
  // Rating score (0-30 points)
  const ratingScore = (factors.rating / 5) * 30;
  
  // Review count score (0-20 points, logarithmic scale)
  const reviewScore = Math.min(20, (Math.log(factors.reviewCount + 1) / Math.log(100)) * 20);
  
  // Completed bookings score (0-20 points, logarithmic scale)
  const bookingScore = Math.min(20, (Math.log(factors.completedBookings + 1) / Math.log(500)) * 20);
  
  // Regional bonus (15 points)
  const regionalBonus = factors.isInUserRegion ? 15 : 0;
  
  // Previous booking bonus (10 points)
  const loyaltyBonus = factors.hasUserBookedBefore ? 10 : 0;
  
  return ratingScore + reviewScore + bookingScore + regionalBonus + loyaltyBonus;
}

/**
 * Generate recommendation reason based on scoring factors
 */
function generateReason(factors: ScoringFactors, governorate: string): { en: string; ar: string } {
  const reasons: string[] = [];
  const reasonsAr: string[] = [];
  
  if (factors.rating >= 4.5) {
    reasons.push("Highly rated");
    reasonsAr.push("تقييم عالي");
  }
  
  if (factors.reviewCount >= 50) {
    reasons.push("Popular choice");
    reasonsAr.push("خيار شائع");
  }
  
  if (factors.isInUserRegion) {
    reasons.push(`Top in ${governorate}`);
    reasonsAr.push(`الأفضل في ${governorate}`);
  }
  
  if (factors.hasUserBookedBefore) {
    reasons.push("You've booked before");
    reasonsAr.push("حجزت من قبل");
  }
  
  if (factors.completedBookings >= 100) {
    reasons.push("Experienced provider");
    reasonsAr.push("مزود خدمة متمرس");
  }
  
  // Default reason if no specific factors
  if (reasons.length === 0) {
    reasons.push("Verified office");
    reasonsAr.push("مكتب موثق");
  }
  
  return {
    en: reasons.join(" • "),
    ar: reasonsAr.join(" • ")
  };
}

/**
 * Get recommended offices for a user based on their region and booking history
 */
export async function getRecommendedOffices(
  userId: number | null,
  userRegion: string | null,
  limit: number = 6
): Promise<RecommendedOffice[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Recommendations] Database not available");
    return [];
  }

  try {
    // Get all verified offices with their stats
    const officesData = await db
      .select({
        id: sanadOffices.id,
        officeName: sanadOffices.officeName,
        officeNameAr: sanadOffices.officeNameAr,
        description: sanadOffices.description,
        descriptionAr: sanadOffices.descriptionAr,
        governorate: sanadOffices.governorate,
        logoUrl: sanadOffices.logoUrl,
        averageRating: sanadOffices.averageRating,
        reviewCount: sql<number>`COALESCE((
          SELECT COUNT(*) FROM ${reviews}
          WHERE ${reviews.officeId} = ${sanadOffices.id}
        ), 0)`,
        completedBookings: sql<number>`COALESCE((
          SELECT COUNT(*) FROM ${bookings}
          WHERE ${bookings.officeId} = ${sanadOffices.id}
          AND ${bookings.status} = 'completed'
        ), 0)`,
      })
      .from(sanadOffices)
      .where(sql`${sanadOffices.verificationStatus} = 'verified'`);

    // Get user's booking history if authenticated
    let userBookedOfficeIds: number[] = [];
    if (userId) {
      const userBookings = await db
        .select({ officeId: bookings.officeId })
        .from(bookings)
        .where(eq(bookings.userId, userId));
      
      userBookedOfficeIds = Array.from(new Set(userBookings.map(b => b.officeId)));
    }

    // Calculate scores for each office
    // Convert to plain objects to ensure proper serialization
    const scoredOffices: RecommendedOffice[] = officesData.map(office => {
      const factors: ScoringFactors = {
        rating: Number(office.averageRating) || 0,
        reviewCount: Number(office.reviewCount) || 0,
        completedBookings: Number(office.completedBookings) || 0,
        isInUserRegion: userRegion ? office.governorate === userRegion : false,
        hasUserBookedBefore: userBookedOfficeIds.includes(office.id),
      };

      const score = calculateScore(factors);
      const reasons = generateReason(factors, office.governorate);

      // Convert to plain object with explicit type conversions
      const rating = typeof office.averageRating === 'string' 
        ? parseFloat(office.averageRating) 
        : Number(office.averageRating) || 0;
      
      return {
        id: office.id,
        officeName: office.officeName,
        officeNameAr: office.officeNameAr || office.officeName,
        description: office.description || "",
        descriptionAr: office.descriptionAr || office.description || "",
        governorate: office.governorate,
        logoUrl: office.logoUrl,
        rating,
        reviewCount: Number(office.reviewCount) || 0,
        completedBookings: Number(office.completedBookings) || 0,
        score,
        reason: reasons.en,
        reasonAr: reasons.ar,
      };
    });

    // Sort by score (descending) and return top N
    return scoredOffices
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

  } catch (error) {
    console.error("[Recommendations] Error getting recommended offices:", error);
    return [];
  }
}

/**
 * Get top offices by region for leaderboards
 */
export async function getTopOfficesByRegion(
  region: string,
  limit: number = 10
): Promise<RecommendedOffice[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Recommendations] Database not available");
    return [];
  }

  try {
    const officesData = await db
      .select({
        id: sanadOffices.id,
        officeName: sanadOffices.officeName,
        officeNameAr: sanadOffices.officeNameAr,
        description: sanadOffices.description,
        descriptionAr: sanadOffices.descriptionAr,
        governorate: sanadOffices.governorate,
        logoUrl: sanadOffices.logoUrl,
        averageRating: sanadOffices.averageRating,
        reviewCount: sql<number>`COALESCE((
          SELECT COUNT(*) FROM ${reviews}
          WHERE ${reviews.officeId} = ${sanadOffices.id}
        ), 0)`,
        completedBookings: sql<number>`COALESCE((
          SELECT COUNT(*) FROM ${bookings}
          WHERE ${bookings.officeId} = ${sanadOffices.id}
          AND ${bookings.status} = 'completed'
        ), 0)`,
      })
      .from(sanadOffices)
      .where(
        and(
          sql`${sanadOffices.verificationStatus} = 'verified'`,
          eq(sanadOffices.governorate, region)
        )
      );

    // Calculate scores for ranking
    // Convert to plain objects to ensure proper serialization
    const scoredOffices: RecommendedOffice[] = officesData.map(office => {
      const factors: ScoringFactors = {
        rating: Number(office.averageRating) || 0,
        reviewCount: Number(office.reviewCount) || 0,
        completedBookings: Number(office.completedBookings) || 0,
        isInUserRegion: true, // All offices are in the target region
        hasUserBookedBefore: false, // Not relevant for leaderboards
      };

      const score = calculateScore(factors);
      const reasons = generateReason(factors, office.governorate);

      // Convert to plain object with explicit type conversions
      const rating = typeof office.averageRating === 'string' 
        ? parseFloat(office.averageRating) 
        : Number(office.averageRating) || 0;
      
      return {
        id: office.id,
        officeName: office.officeName,
        officeNameAr: office.officeNameAr || office.officeName,
        description: office.description || "",
        descriptionAr: office.descriptionAr || office.description || "",
        governorate: office.governorate,
        logoUrl: office.logoUrl,
        rating,
        reviewCount: Number(office.reviewCount) || 0,
        completedBookings: Number(office.completedBookings) || 0,
        score,
        reason: reasons.en,
        reasonAr: reasons.ar,
      };
    });

    return scoredOffices
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

  } catch (error) {
    console.error("[Recommendations] Error getting top offices by region:", error);
    return [];
  }
}
