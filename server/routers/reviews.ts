import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

export const reviewsRouter = router({
  /**
   * Generate AI-powered response suggestions for a review
   */
  generateResponseSuggestions: protectedProcedure
    .input(
      z.object({
        reviewId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string(),
        tone: z.enum(["professional", "friendly", "apologetic"]),
      })
    )
    .query(async ({ input }) => {
      const { rating, comment, tone } = input;

      // Determine sentiment and response strategy
      const isPositive = rating >= 4;
      const isNeutral = rating === 3;
      const isNegative = rating <= 2;

      let systemPrompt = "";

      if (tone === "professional") {
        systemPrompt = `You are a professional business communication expert helping a Sanad office owner respond to customer reviews. Generate polite, professional responses that maintain business credibility.`;
      } else if (tone === "friendly") {
        systemPrompt = `You are a friendly and warm business communication expert. Generate responses that are personable, approachable, and build customer relationships while maintaining professionalism.`;
      } else {
        systemPrompt = `You are an empathetic customer service expert. Generate sincere, apologetic responses that acknowledge concerns, take responsibility, and offer solutions.`;
      }

      const userPrompt = `
A customer left the following review:
Rating: ${rating}/5 stars
Comment: "${comment}"

Generate 3 different response options that:
${isPositive ? "- Thank the customer warmly for their positive feedback" : ""}
${isPositive ? "- Acknowledge specific points they mentioned" : ""}
${isPositive ? "- Invite them to return for future services" : ""}
${isNeutral ? "- Thank them for their feedback" : ""}
${isNeutral ? "- Address any concerns mentioned" : ""}
${isNeutral ? "- Offer to discuss how to improve their experience" : ""}
${isNegative ? "- Apologize sincerely for their negative experience" : ""}
${isNegative ? "- Acknowledge the specific issues they raised" : ""}
${isNegative ? "- Offer concrete solutions or next steps" : ""}
${isNegative ? "- Invite them to contact you directly to resolve the issue" : ""}
- Are concise (2-3 sentences each)
- Sound natural and genuine
- Maintain a ${tone} tone
- Are appropriate for a business services platform

Return ONLY a JSON array with 3 objects, each containing a "text" field with the response.
Example format: [{"text": "Response 1..."}, {"text": "Response 2..."}, {"text": "Response 3..."}]
`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "review_responses",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  responses: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        text: {
                          type: "string",
                          description: "The response text",
                        },
                      },
                      required: ["text"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["responses"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0].message.content;
        if (!content || typeof content !== "string") {
          throw new Error("No response from LLM");
        }

        const parsed = JSON.parse(content);
        return parsed.responses || [];
      } catch (error) {
        console.error("[Reviews] Error generating suggestions:", error);
        
        // Fallback to template-based responses
        return generateFallbackResponses(rating, comment, tone);
      }
    }),
});

/**
 * Fallback template-based responses when LLM is unavailable
 */
function generateFallbackResponses(
  rating: number,
  comment: string,
  tone: "professional" | "friendly" | "apologetic"
) {
  const isPositive = rating >= 4;
  const isNegative = rating <= 2;

  if (isPositive) {
    return [
      {
        text: `Thank you so much for your wonderful feedback! We're delighted that you had a great experience with our services. We look forward to serving you again in the future.`,
      },
      {
        text: `We truly appreciate your kind words and positive review. It's feedback like yours that motivates our team to continue delivering excellent service. Thank you for choosing us!`,
      },
      {
        text: `Your satisfaction is our top priority, and we're thrilled to hear that we met your expectations. Thank you for taking the time to share your experience!`,
      },
    ];
  } else if (isNegative) {
    return [
      {
        text: `We sincerely apologize for your disappointing experience. Your feedback is important to us, and we'd like the opportunity to make things right. Please contact us directly so we can address your concerns.`,
      },
      {
        text: `Thank you for bringing this to our attention. We're sorry we didn't meet your expectations and would appreciate the chance to discuss this further. Please reach out to us so we can resolve this issue.`,
      },
      {
        text: `We're truly sorry for the issues you encountered. This is not the standard of service we strive for. We'd like to speak with you personally to understand what went wrong and how we can improve.`,
      },
    ];
  } else {
    return [
      {
        text: `Thank you for your feedback. We appreciate you taking the time to share your experience. If there's anything specific we can do to improve, please don't hesitate to let us know.`,
      },
      {
        text: `We value your input and are always looking for ways to enhance our services. Thank you for your review, and we hope to serve you better in the future.`,
      },
      {
        text: `Thank you for your honest feedback. We're committed to continuous improvement and would welcome the opportunity to discuss your experience further.`,
      },
    ];
  }
}
