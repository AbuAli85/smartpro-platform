/**
 * Performance-Based Office Ranking System
 * 
 * Calculates composite performance scores for Sanad offices based on:
 * - Average rating (40% weight)
 * - Response time (25% weight)
 * - Completion rate (20% weight)
 * - Review sentiment (15% weight)
 * 
 * Score range: 0-100
 */

import * as db from "./db";
import { invokeLLM } from "./_core/llm";

interface PerformanceMetrics {
  officeId: number;
  averageRating: number;
  totalReviews: number;
  responseTimeHours: number;
  completionRate: number;
  sentimentScore: number;
  compositeScore: number;
  rank: number;
}

/**
 * Calculate performance score for a single office
 */
export async function calculateOfficePerformance(officeId: number): Promise<PerformanceMetrics> {
  // Get office reviews
  const reviews = await db.getOfficeReviews(officeId);
  
  // Get office bookings
  const bookings = await db.getOfficeBookings(officeId);

  // 1. Average Rating (40% weight)
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
    : 0;
  const ratingScore = (averageRating / 5) * 100;

  // 2. Response Time (25% weight)
  // Calculate average time from booking creation to first response
  const responseTimes = bookings
    .filter((b: any) => b.respondedAt && b.createdAt)
    .map((b: any) => {
      const created = new Date(b.createdAt).getTime();
      const responded = new Date(b.respondedAt).getTime();
      return (responded - created) / (1000 * 60 * 60); // hours
    });

  const avgResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((sum: number, t: number) => sum + t, 0) / responseTimes.length
    : 24; // Default to 24 hours if no data

  // Score: faster response = higher score (24h = 100%, 48h = 50%, 72h+ = 0%)
  const responseScore = Math.max(0, Math.min(100, ((72 - avgResponseTime) / 72) * 100));

  // 3. Completion Rate (20% weight)
  const completedBookings = bookings.filter((b: any) => b.status === "completed").length;
  const completionRate = bookings.length > 0 ? (completedBookings / bookings.length) * 100 : 0;

  // 4. Review Sentiment (15% weight)
  const sentimentScore = await calculateSentimentScore(reviews);

  // Calculate composite score
  const compositeScore =
    ratingScore * 0.4 +
    responseScore * 0.25 +
    completionRate * 0.2 +
    sentimentScore * 0.15;

  return {
    officeId,
    averageRating: parseFloat(averageRating.toFixed(2)),
    totalReviews: reviews.length,
    responseTimeHours: parseFloat(avgResponseTime.toFixed(2)),
    completionRate: parseFloat(completionRate.toFixed(2)),
    sentimentScore: parseFloat(sentimentScore.toFixed(2)),
    compositeScore: parseFloat(compositeScore.toFixed(2)),
    rank: 0, // Will be set after sorting all offices
  };
}

/**
 * Calculate sentiment score from review text using LLM
 */
async function calculateSentimentScore(reviews: any[]): Promise<number> {
  if (reviews.length === 0) return 50; // Neutral default

  const reviewTexts = reviews
    .filter((r: any) => r.reviewText && r.reviewText.trim().length > 0)
    .map((r: any) => r.reviewText);

  if (reviewTexts.length === 0) return 50;

  // For performance, analyze only recent reviews (max 10)
  const recentReviews = reviewTexts.slice(0, 10);

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are a sentiment analysis expert. Analyze customer reviews and return a sentiment score from 0-100, where 0 is very negative, 50 is neutral, and 100 is very positive.",
        },
        {
          role: "user",
          content: `Analyze the overall sentiment of these customer reviews and return ONLY a number from 0-100:\n\n${recentReviews.join("\n\n")}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "sentiment_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              score: {
                type: "number",
                description: "Sentiment score from 0-100",
              },
            },
            required: ["score"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (!content || typeof content !== "string") {
      return 50;
    }

    const parsed = JSON.parse(content);
    return Math.max(0, Math.min(100, parsed.score));
  } catch (error) {
    console.error("[Performance Ranking] Error calculating sentiment:", error);
    
    // Fallback: simple rating-based sentiment
    const avgRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;
    return (avgRating / 5) * 100;
  }
}

/**
 * Calculate and rank all active offices
 */
export async function rankAllOffices(): Promise<PerformanceMetrics[]> {
  // Get all active offices
  const offices = await db.getAllOffices();
  const activeOffices = offices.filter((o: any) => o.status === "active");

  // Calculate performance for each office
  const performances: PerformanceMetrics[] = [];
  for (const office of activeOffices) {
    const perf = await calculateOfficePerformance(office.id);
    performances.push(perf);
  }

  // Sort by composite score (descending)
  performances.sort((a, b) => b.compositeScore - a.compositeScore);

  // Assign ranks
  performances.forEach((perf, index) => {
    perf.rank = index + 1;
  });

  return performances;
}

/**
 * Get top performing offices
 */
export async function getTopPerformers(limit: number = 10): Promise<PerformanceMetrics[]> {
  const rankings = await rankAllOffices();
  return rankings.slice(0, limit);
}

/**
 * Check if office qualifies for "Top Performer" badge
 * Criteria: Top 20% and score >= 75
 */
export function isTopPerformer(metrics: PerformanceMetrics, totalOffices: number): boolean {
  const topPercentile = Math.ceil(totalOffices * 0.2);
  return metrics.rank <= topPercentile && metrics.compositeScore >= 75;
}

/**
 * Update performance metrics for all offices (scheduled job)
 */
export async function updateAllPerformanceMetrics(): Promise<void> {
  console.log("[Performance Ranking] Starting performance metrics update...");

  try {
    const rankings = await rankAllOffices();

    // Save to database
    for (const metrics of rankings) {
      await db.saveOfficePerformanceMetrics(metrics);
    }

    console.log(`[Performance Ranking] Updated metrics for ${rankings.length} offices`);
  } catch (error) {
    console.error("[Performance Ranking] Error updating metrics:", error);
  }
}
