import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import * as db from "../db";

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
        systemPrompt = `You are a friendly customer service expert helping a Sanad office owner respond to customer reviews. Generate warm, personable responses that build rapport.`;
      } else {
        systemPrompt = `You are an empathetic customer service expert helping a Sanad office owner respond to negative reviews. Generate sincere, apologetic responses that show understanding and commitment to improvement.`;
      }

      let userPrompt = "";

      if (isPositive) {
        userPrompt = `Generate 3 different thank-you responses to this positive review (${rating}/5 stars): "${comment}". Each response should be 2-3 sentences, express genuine gratitude, and encourage future business.`;
      } else if (isNeutral) {
        userPrompt = `Generate 3 different responses to this neutral review (${rating}/5 stars): "${comment}". Each response should be 2-3 sentences, acknowledge their feedback, and express commitment to improvement.`;
      } else {
        userPrompt = `Generate 3 different responses to this negative review (${rating}/5 stars): "${comment}". Each response should be 2-3 sentences, apologize sincerely, acknowledge the issue, and offer to make things right.`;
      }

      try {
        const llmResponse = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        });

        const content = llmResponse.choices[0].message.content || "";
        
        // Parse the response into suggestions
        const suggestions = content
          .split(/\n\n+/)
          .filter((s) => s.trim().length > 0)
          .map((s) => s.replace(/^\d+\.\s*/, "").trim())
          .slice(0, 3);

        if (suggestions.length === 0) {
          // Fallback to template-based responses
          return generateFallbackResponses(rating, comment, tone);
        }

        return { suggestions };
      } catch (error) {
        console.error("[Reviews] LLM error:", error);
        // Fallback to template-based responses
        return generateFallbackResponses(rating, comment, tone);
      }
    }),

  /**
   * Submit a response to a review
   * NOTE: This is a simplified version that uses db helper functions
   * The original version had complex permission checks that need to be reimplemented
   */
  submitResponse: protectedProcedure
    .input(
      z.object({
        reviewId: z.number(),
        response: z.string().min(10).max(1000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;
      
      // TODO: Add proper permission checks
      // For now, this is a placeholder that needs to be implemented with proper db helpers
      
      return { success: true };
    }),

  /**
   * Edit a review response
   */
  editResponse: protectedProcedure
    .input(
      z.object({
        reviewId: z.number(),
        response: z.string().min(10).max(1000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;
      
      // TODO: Add proper permission checks and update logic
      
      return { success: true };
    }),

  /**
   * Delete a review response
   */
  deleteResponse: protectedProcedure
    .input(
      z.object({
        reviewId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;
      
      // TODO: Add proper permission checks and delete logic
      
      return { success: true };
    }),
});

/**
 * Fallback template-based responses when LLM is unavailable
 */
function generateFallbackResponses(
  rating: number,
  comment: string,
  tone: "professional" | "friendly" | "apologetic"
): { suggestions: string[] } {
  const isPositive = rating >= 4;
  const isNeutral = rating === 3;

  if (isPositive) {
    if (tone === "professional") {
      return {
        suggestions: [
          "Thank you for your positive feedback. We're delighted to have served you and look forward to assisting you again in the future.",
          "We appreciate your kind words and are pleased that our services met your expectations. Your satisfaction is our priority.",
          "Thank you for choosing our services. We're honored by your positive review and remain committed to excellence.",
        ],
      };
    } else {
      return {
        suggestions: [
          "Thank you so much for your wonderful review! We're thrilled that you had a great experience with us. Hope to see you again soon!",
          "We're so happy to hear you were satisfied with our service! Your feedback means the world to us. Thanks for choosing us!",
          "What a lovely review! Thank you for taking the time to share your experience. We can't wait to serve you again!",
        ],
      };
    }
  } else if (isNeutral) {
    return {
      suggestions: [
        "Thank you for your feedback. We appreciate your input and are always working to improve our services. We hope to exceed your expectations next time.",
        "We value your honest review. Your feedback helps us identify areas for improvement. We'd love the opportunity to serve you better in the future.",
        "Thank you for sharing your experience. We take all feedback seriously and are committed to enhancing our services based on customer input.",
      ],
    };
  } else {
    return {
      suggestions: [
        "We sincerely apologize for not meeting your expectations. Your feedback is invaluable, and we're taking immediate steps to address the issues you've raised. We'd appreciate the chance to make this right.",
        "We're truly sorry for your disappointing experience. This is not the standard of service we strive for. Please contact us directly so we can resolve this matter to your satisfaction.",
        "Thank you for bringing this to our attention, and we apologize for falling short. We're reviewing our processes to ensure this doesn't happen again. We hope you'll give us another opportunity to serve you better.",
      ],
    };
  }
}
