/**
 * Service Recommendation Engine
 * 
 * Analyzes user responses to a questionnaire and recommends services
 * based on weighted scoring algorithm.
 */

export interface QuestionnaireAnswers {
  businessType: string; // "startup" | "sme" | "enterprise" | "individual"
  urgency: string; // "immediate" | "within_week" | "within_month" | "flexible"
  budget: string; // "low" | "medium" | "high" | "no_limit"
  complexity: string; // "simple" | "moderate" | "complex"
  documentsReady: string; // "yes" | "partial" | "no"
}

export interface ServiceRecommendation {
  serviceId: number;
  serviceName: string;
  matchScore: number; // 0-100
  reasons: string[];
  price: string;
  estimatedDuration: string;
}

// Scoring weights (must sum to 100)
const WEIGHTS = {
  businessType: 20,
  urgency: 25,
  budget: 30,
  complexity: 15,
  documentsReady: 10,
};

// Service compatibility matrix
const SERVICE_PROFILES = {
  "Commercial Registration": {
    businessType: { startup: 100, sme: 90, enterprise: 80, individual: 70 },
    urgency: { immediate: 60, within_week: 90, within_month: 100, flexible: 80 },
    budget: { low: 60, medium: 100, high: 90, no_limit: 80 },
    complexity: { simple: 100, moderate: 80, complex: 60 },
    documentsReady: { yes: 100, partial: 70, no: 40 },
  },
  "Tax Registration": {
    businessType: { startup: 90, sme: 100, enterprise: 100, individual: 50 },
    urgency: { immediate: 70, within_week: 100, within_month: 90, flexible: 70 },
    budget: { low: 80, medium: 100, high: 90, no_limit: 80 },
    complexity: { simple: 90, moderate: 100, complex: 80 },
    documentsReady: { yes: 100, partial: 60, no: 30 },
  },
  "VAT Registration": {
    businessType: { startup: 70, sme: 100, enterprise: 100, individual: 40 },
    urgency: { immediate: 60, within_week: 90, within_month: 100, flexible: 80 },
    budget: { low: 70, medium: 100, high: 90, no_limit: 80 },
    complexity: { simple: 70, moderate: 90, complex: 100 },
    documentsReady: { yes: 100, partial: 50, no: 20 },
  },
  "Business License Renewal": {
    businessType: { startup: 50, sme: 90, enterprise: 100, individual: 60 },
    urgency: { immediate: 100, within_week: 90, within_month: 70, flexible: 50 },
    budget: { low: 90, medium: 100, high: 80, no_limit: 70 },
    complexity: { simple: 100, moderate: 80, complex: 60 },
    documentsReady: { yes: 100, partial: 80, no: 50 },
  },
  "Contract Drafting": {
    businessType: { startup: 80, sme: 90, enterprise: 100, individual: 70 },
    urgency: { immediate: 80, within_week: 100, within_month: 90, flexible: 70 },
    budget: { low: 50, medium: 80, high: 100, no_limit: 100 },
    complexity: { simple: 60, moderate: 80, complex: 100 },
    documentsReady: { yes: 90, partial: 100, no: 80 },
  },
  "Legal Consultation": {
    businessType: { startup: 90, sme: 90, enterprise: 90, individual: 100 },
    urgency: { immediate: 100, within_week: 90, within_month: 70, flexible: 60 },
    budget: { low: 60, medium: 90, high: 100, no_limit: 100 },
    complexity: { simple: 100, moderate: 90, complex: 80 },
    documentsReady: { yes: 80, partial: 90, no: 100 },
  },
  "Trademark Registration": {
    businessType: { startup: 100, sme: 90, enterprise: 80, individual: 70 },
    urgency: { immediate: 50, within_week: 70, within_month: 100, flexible: 90 },
    budget: { low: 50, medium: 80, high: 100, no_limit: 100 },
    complexity: { simple: 70, moderate: 100, complex: 90 },
    documentsReady: { yes: 100, partial: 70, no: 40 },
  },
  "Company Formation": {
    businessType: { startup: 100, sme: 80, enterprise: 60, individual: 50 },
    urgency: { immediate: 60, within_week: 80, within_month: 100, flexible: 90 },
    budget: { low: 40, medium: 70, high: 100, no_limit: 100 },
    complexity: { simple: 60, moderate: 80, complex: 100 },
    documentsReady: { yes: 90, partial: 70, no: 50 },
  },
};

/**
 * Calculate match score for a service based on questionnaire answers
 */
function calculateServiceScore(
  serviceName: string,
  answers: QuestionnaireAnswers
): { score: number; reasons: string[] } {
  const profile = SERVICE_PROFILES[serviceName as keyof typeof SERVICE_PROFILES];
  
  if (!profile) {
    // Default scoring for services not in the profile matrix
    return { score: 50, reasons: ["General service match"] };
  }

  const reasons: string[] = [];
  let totalScore = 0;

  // Business Type Score
  const businessTypeScore = profile.businessType[answers.businessType as keyof typeof profile.businessType] || 50;
  totalScore += (businessTypeScore / 100) * WEIGHTS.businessType;
  if (businessTypeScore >= 90) {
    reasons.push(`Perfect fit for ${answers.businessType} businesses`);
  }

  // Urgency Score
  const urgencyScore = profile.urgency[answers.urgency as keyof typeof profile.urgency] || 50;
  totalScore += (urgencyScore / 100) * WEIGHTS.urgency;
  if (urgencyScore >= 90 && answers.urgency === "immediate") {
    reasons.push("Can be processed quickly");
  }

  // Budget Score
  const budgetScore = profile.budget[answers.budget as keyof typeof profile.budget] || 50;
  totalScore += (budgetScore / 100) * WEIGHTS.budget;
  if (budgetScore >= 90) {
    reasons.push(`Matches your ${answers.budget} budget range`);
  }

  // Complexity Score
  const complexityScore = profile.complexity[answers.complexity as keyof typeof profile.complexity] || 50;
  totalScore += (complexityScore / 100) * WEIGHTS.complexity;
  if (complexityScore >= 90) {
    reasons.push(`Appropriate for ${answers.complexity} requirements`);
  }

  // Documents Ready Score
  const documentsScore = profile.documentsReady[answers.documentsReady as keyof typeof profile.documentsReady] || 50;
  totalScore += (documentsScore / 100) * WEIGHTS.documentsReady;
  if (documentsScore >= 90 && answers.documentsReady === "yes") {
    reasons.push("You have all required documents ready");
  } else if (documentsScore < 50 && answers.documentsReady === "no") {
    reasons.push("May require document preparation assistance");
  }

  return {
    score: Math.round(totalScore),
    reasons: reasons.length > 0 ? reasons : ["Good general match for your needs"],
  };
}

/**
 * Get top service recommendations based on questionnaire answers
 */
export function getServiceRecommendations(
  services: Array<{
    id: number;
    serviceName: string;
    price: string;
    estimatedDeliveryDays: number | null;
  }>,
  answers: QuestionnaireAnswers,
  limit: number = 3
): ServiceRecommendation[] {
  const recommendations: ServiceRecommendation[] = services.map((service) => {
    const { score, reasons } = calculateServiceScore(service.serviceName, answers);

    return {
      serviceId: service.id,
      serviceName: service.serviceName,
      matchScore: score,
      reasons,
      price: service.price,
      estimatedDuration: service.estimatedDeliveryDays
        ? `${service.estimatedDeliveryDays} days`
        : "3-5 days",
    };
  });

  // Sort by match score (descending) and return top N
  return recommendations
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}
