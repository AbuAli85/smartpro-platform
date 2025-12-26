import { invokeLLM } from "./llm";

/**
 * Translate text between Arabic and English using LLM
 * @param text - Text to translate
 * @param targetLanguage - Target language ('ar' for Arabic, 'en' for English)
 * @returns Translated text
 */
export async function translateMessage(
  text: string,
  targetLanguage: "ar" | "en"
): Promise<{ translatedText: string; detectedLanguage: string }> {
  try {
    const targetLangName = targetLanguage === "ar" ? "Arabic" : "English";
    
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a professional translator specializing in Arabic and English. Translate the given text to ${targetLangName}. Only return the translated text without any explanations or additional commentary.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    const translatedText = typeof content === 'string' ? content.trim() : text;
    
    // Simple language detection based on character ranges
    const detectedLanguage = /[\u0600-\u06FF]/.test(text) ? "ar" : "en";

    return {
      translatedText,
      detectedLanguage,
    };
  } catch (error) {
    console.error("[Translation] Error translating message:", error);
    // Return original text on error
    return {
      translatedText: text,
      detectedLanguage: "unknown",
    };
  }
}

/**
 * Detect the language of a text
 * @param text - Text to detect language for
 * @returns Language code ('ar', 'en', or 'unknown')
 */
export function detectLanguage(text: string): "ar" | "en" | "unknown" {
  // Check for Arabic characters
  if (/[\u0600-\u06FF]/.test(text)) {
    return "ar";
  }
  
  // Check for English characters
  if (/[a-zA-Z]/.test(text)) {
    return "en";
  }
  
  return "unknown";
}
