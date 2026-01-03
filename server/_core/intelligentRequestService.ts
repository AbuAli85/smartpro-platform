import { invokeLLM } from './llm';

/**
 * AI-Powered Service Type Detection
 * Analyzes the service description and automatically suggests the most appropriate service type
 */
export async function detectServiceType(params: {
  title: string;
  description: string;
}): Promise<{
  suggestedType: string;
  confidence: number;
  reasoning: string;
}> {
  const { title, description } = params;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `You are an expert in Omani business services. Analyze service requests and categorize them into one of these types:
- Commercial Registration (تسجيل تجاري)
- Tax Registration (تسجيل ضريبي)
- VAT Registration (تسجيل ضريبة القيمة المضافة)
- Legal Consultation (استشارة قانونية)
- Accounting Services (خدمات محاسبية)
- Business License (ترخيص تجاري)
- Work Permit (تصريح عمل)
- Other Services (خدمات أخرى)

Provide your response as a JSON object with: suggestedType, confidence (0-100), and reasoning.`,
        },
        {
          role: 'user',
          content: `Title: ${title}\nDescription: ${description}`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'service_type_detection',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              suggestedType: {
                type: 'string',
                description: 'The suggested service type category',
              },
              confidence: {
                type: 'number',
                description: 'Confidence score from 0 to 100',
              },
              reasoning: {
                type: 'string',
                description: 'Brief explanation for the suggestion',
              },
            },
            required: ['suggestedType', 'confidence', 'reasoning'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const result = JSON.parse(typeof content === 'string' ? content : '{}');
    return result;
  } catch (error) {
    console.error('❌ Service type detection failed:', error);
    return {
      suggestedType: 'Other Services',
      confidence: 0,
      reasoning: 'Unable to detect service type automatically',
    };
  }
}

/**
 * Smart Budget Recommendation
 * Analyzes historical data and service type to suggest appropriate budget range
 */
export async function recommendBudget(params: {
  serviceType: string;
  description: string;
  deadline: string;
  historicalData?: { avgPrice: number; minPrice: number; maxPrice: number };
}): Promise<{
  recommendedMin: number;
  recommendedMax: number;
  marketAverage: number;
  reasoning: string;
}> {
  const { serviceType, description, deadline, historicalData } = params;

  try {
    const systemPrompt = `You are a pricing expert for business services in Oman. Based on the service type, description, and deadline, recommend a realistic budget range in Omani Rials (OMR).

${historicalData ? `Historical market data for ${serviceType}:
- Average price: ${historicalData.avgPrice} OMR
- Price range: ${historicalData.minPrice} - ${historicalData.maxPrice} OMR` : 'No historical data available - use your expertise.'}

Consider:
- Service complexity
- Urgency (deadline)
- Market rates in Oman
- Typical office pricing

Provide realistic budget recommendations that will attract quality bids.`;

    const response = await invokeLLM({
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Service Type: ${serviceType}\nDescription: ${description}\nDeadline: ${deadline}`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'budget_recommendation',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              recommendedMin: {
                type: 'number',
                description: 'Recommended minimum budget in OMR',
              },
              recommendedMax: {
                type: 'number',
                description: 'Recommended maximum budget in OMR',
              },
              marketAverage: {
                type: 'number',
                description: 'Market average price in OMR',
              },
              reasoning: {
                type: 'string',
                description: 'Explanation for the budget recommendation',
              },
            },
            required: ['recommendedMin', 'recommendedMax', 'marketAverage', 'reasoning'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const result = JSON.parse(typeof content === 'string' ? content : '{}');
    return result;
  } catch (error) {
    console.error('❌ Budget recommendation failed:', error);
    return {
      recommendedMin: 100,
      recommendedMax: 500,
      marketAverage: 300,
      reasoning: 'Default budget range based on typical service pricing',
    };
  }
}

/**
 * Automatic Requirement Checklist Generator
 * Generates a list of required documents and information based on service type
 */
export async function generateRequirementChecklist(params: {
  serviceType: string;
  description: string;
}): Promise<{
  requirements: Array<{
    category: string;
    items: string[];
    mandatory: boolean;
  }>;
  estimatedProcessingTime: string;
}> {
  const { serviceType, description } = params;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `You are an expert in Omani business documentation requirements. Generate a comprehensive checklist of required documents and information for the given service type.

Organize requirements into categories:
- Identity Documents
- Business Documents
- Financial Documents
- Legal Documents
- Other Requirements

For each category, list specific items and indicate if they are mandatory or optional.
Also provide an estimated processing time.`,
        },
        {
          role: 'user',
          content: `Service Type: ${serviceType}\nDescription: ${description}`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'requirement_checklist',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              requirements: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    category: { type: 'string' },
                    items: {
                      type: 'array',
                      items: { type: 'string' },
                    },
                    mandatory: { type: 'boolean' },
                  },
                  required: ['category', 'items', 'mandatory'],
                  additionalProperties: false,
                },
              },
              estimatedProcessingTime: {
                type: 'string',
                description: 'Estimated time to complete the service (e.g., "3-5 business days")',
              },
            },
            required: ['requirements', 'estimatedProcessingTime'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const result = JSON.parse(typeof content === 'string' ? content : '{}');
    return result;
  } catch (error) {
    console.error('❌ Requirement checklist generation failed:', error);
    return {
      requirements: [
        {
          category: 'Identity Documents',
          items: ['Valid Omani ID or Passport', 'Contact Information'],
          mandatory: true,
        },
        {
          category: 'Business Documents',
          items: ['Business plan or description', 'Proof of address'],
          mandatory: false,
        },
      ],
      estimatedProcessingTime: '5-7 business days',
    };
  }
}

/**
 * Estimated Timeline Prediction
 * Predicts realistic completion timeline based on service type and complexity
 */
export async function predictTimeline(params: {
  serviceType: string;
  description: string;
  urgency: string;
}): Promise<{
  estimatedDays: number;
  breakdown: Array<{
    phase: string;
    duration: string;
  }>;
  factors: string[];
}> {
  const { serviceType, description, urgency } = params;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `You are a project timeline expert for Omani business services. Provide realistic timeline estimates including:
- Total estimated days
- Phase-by-phase breakdown
- Factors affecting the timeline

Consider:
- Service complexity
- Government processing times in Oman
- Document preparation time
- Urgency level`,
        },
        {
          role: 'user',
          content: `Service Type: ${serviceType}\nDescription: ${description}\nUrgency: ${urgency}`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'timeline_prediction',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              estimatedDays: {
                type: 'number',
                description: 'Total estimated days to complete',
              },
              breakdown: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    phase: { type: 'string' },
                    duration: { type: 'string' },
                  },
                  required: ['phase', 'duration'],
                  additionalProperties: false,
                },
              },
              factors: {
                type: 'array',
                items: { type: 'string' },
                description: 'Factors that may affect the timeline',
              },
            },
            required: ['estimatedDays', 'breakdown', 'factors'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const result = JSON.parse(typeof content === 'string' ? content : '{}');
    return result;
  } catch (error) {
    console.error('❌ Timeline prediction failed:', error);
    return {
      estimatedDays: 7,
      breakdown: [
        { phase: 'Document preparation', duration: '1-2 days' },
        { phase: 'Office processing', duration: '3-4 days' },
        { phase: 'Final review', duration: '1-2 days' },
      ],
      factors: ['Document completeness', 'Government processing times', 'Service complexity'],
    };
  }
}

/**
 * Smart Office Matching Algorithm
 * Matches service requests with the most suitable offices based on multiple factors
 */
export async function matchOffices(params: {
  serviceType: string;
  governorate: string;
  budget: number;
  urgency: string;
  description: string;
  offices: Array<{
    id: number;
    name: string;
    governorate: string;
    serviceCategories: string[];
    averageRating: number;
    completedBookings: number;
    responseTime: number; // in hours
  }>;
}): Promise<
  Array<{
    officeId: number;
    officeName: string;
    matchScore: number;
    reasons: string[];
    estimatedResponseTime: string;
  }>
> {
  const { serviceType, governorate, budget, urgency, description, offices } = params;

  // Filter offices that match service type and location
  const matchedOffices = offices
    .filter((office) => {
      const locationMatch = office.governorate === governorate || governorate === 'Any Location';
      const serviceMatch = office.serviceCategories.some((cat) =>
        cat.toLowerCase().includes(serviceType.toLowerCase())
      );
      return locationMatch && serviceMatch;
    })
    .map((office) => {
      // Calculate match score based on multiple factors
      let score = 0;
      const reasons: string[] = [];

      // Rating score (0-30 points)
      const ratingScore = (office.averageRating / 5) * 30;
      score += ratingScore;
      if (office.averageRating >= 4.5) {
        reasons.push('Highly rated (4.5+ stars)');
      }

      // Experience score (0-25 points)
      const experienceScore = Math.min((office.completedBookings / 100) * 25, 25);
      score += experienceScore;
      if (office.completedBookings >= 50) {
        reasons.push('Experienced (50+ completed projects)');
      }

      // Response time score (0-25 points)
      const responseScore = Math.max(25 - office.responseTime * 2, 0);
      score += responseScore;
      if (office.responseTime <= 2) {
        reasons.push('Fast response time (< 2 hours)');
      }

      // Location match (0-20 points)
      if (office.governorate === governorate) {
        score += 20;
        reasons.push('Located in your governorate');
      }

      // Urgency match
      if (urgency === 'urgent' && office.responseTime <= 4) {
        score += 10;
        reasons.push('Available for urgent requests');
      }

      return {
        officeId: office.id,
        officeName: office.name,
        matchScore: Math.round(score),
        reasons,
        estimatedResponseTime: `${office.responseTime} hours`,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5); // Return top 5 matches

  return matchedOffices;
}

/**
 * Comprehensive Request Analysis
 * Combines all AI features to provide complete analysis of a service request
 */
export async function analyzeServiceRequest(params: {
  title: string;
  description: string;
  serviceType?: string;
  deadline: string;
  urgency: string;
}): Promise<{
  serviceTypeDetection: Awaited<ReturnType<typeof detectServiceType>>;
  budgetRecommendation: Awaited<ReturnType<typeof recommendBudget>>;
  requirementChecklist: Awaited<ReturnType<typeof generateRequirementChecklist>>;
  timelinePrediction: Awaited<ReturnType<typeof predictTimeline>>;
}> {
  const { title, description, serviceType, deadline, urgency } = params;

  // Run all analyses in parallel for better performance
  const [serviceTypeDetection, budgetRecommendation, requirementChecklist, timelinePrediction] =
    await Promise.all([
      serviceType ? Promise.resolve({ suggestedType: serviceType, confidence: 100, reasoning: 'User-selected' }) : detectServiceType({ title, description }),
      recommendBudget({ serviceType: serviceType || 'Other Services', description, deadline }),
      generateRequirementChecklist({ serviceType: serviceType || 'Other Services', description }),
      predictTimeline({ serviceType: serviceType || 'Other Services', description, urgency }),
    ]);

  return {
    serviceTypeDetection,
    budgetRecommendation,
    requirementChecklist,
    timelinePrediction,
  };
}
