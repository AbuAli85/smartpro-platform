import { invokeLLM } from "./llm";

/**
 * Translate text from English to Arabic using LLM
 */
export async function translateToArabic(params: {
  text: string;
  context?: string;
}): Promise<{
  translatedText: string;
  confidence: "high" | "medium" | "low";
}> {
  const contextHint = params.context
    ? `This is a ${params.context.replace("_", " ")} for a business services platform.`
    : "This is content for a business services platform.";

  const systemPrompt = `You are a professional English-to-Arabic translator specializing in business and government services content.
${contextHint}

Translation Guidelines:
- Maintain professional, formal tone appropriate for business context
- Preserve technical terms and proper nouns when appropriate
- Use Modern Standard Arabic (MSA)
- Keep formatting and structure
- Be concise and clear
- Only return the translated text, nothing else`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Translate to Arabic:\n\n${params.text}` },
      ],
    });

    const content = response.choices[0]?.message?.content;
    const translatedText = typeof content === "string" ? content.trim() : "";

    // Simple confidence heuristic based on length ratio
    const lengthRatio = translatedText.length / params.text.length;
    const confidence: "high" | "medium" | "low" =
      lengthRatio >= 0.5 && lengthRatio <= 2.0
        ? "high"
        : lengthRatio >= 0.3 && lengthRatio <= 3.0
        ? "medium"
        : "low";

    return {
      translatedText,
      confidence,
    };
  } catch (error) {
    console.error("Machine translation error:", error);
    throw new Error("Translation failed. Please try again.");
  }
}

/**
 * Batch translate multiple texts
 */
export async function batchTranslateToArabic(params: {
  texts: Array<{ text: string; context?: string }>;
}): Promise<
  Array<{
    translatedText: string;
    confidence: "high" | "medium" | "low";
  }>
> {
  // Translate sequentially to avoid rate limits
  const results = [];
  for (const item of params.texts) {
    const result = await translateToArabic(item);
    results.push(result);
  }
  return results;
}
