/**
 * Enhanced Arabic content seeding with LLM-powered professional translations
 * Run with: node server/seedArabicContentEnhanced.mjs
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
import { invokeLLM } from "./_core/llm.js";

dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

// LLM translation helper using the built-in invokeLLM
async function translateToArabic(text, context = "") {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a professional Arabic translator specializing in business and legal terminology. Translate the given English text to Modern Standard Arabic (MSA) with proper business terminology. Only return the translation, no explanations."
        },
        {
          role: "user",
          content: `Translate this ${context} to Arabic: "${text}"`
        }
      ],
    });
    
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Translation error:", error.message);
    return `${text} (عربي)`;
  }
}

async function seedOfficeTranslations() {
  console.log("🌍 Seeding office Arabic translations with LLM...\n");
  
  try {
    // Get all offices without Arabic names
    const [offices] = await connection.query(
      "SELECT id, officeName, description FROM sanad_offices WHERE officeNameAr IS NULL OR officeNameAr = '' OR officeNameAr LIKE '%(عربي)%'"
    );
    
    console.log(`Found ${offices.length} offices to translate\n`);
    let updated = 0;
    
    for (const office of offices) {
      console.log(`Translating: ${office.officeName}...`);
      
      // Translate office name
      const arabicName = await translateToArabic(office.officeName, "business office name");
      console.log(`  → ${arabicName}`);
      
      // Translate description if exists
      let arabicDesc = "خدمات الأعمال المهنية";
      if (office.description) {
        arabicDesc = await translateToArabic(
          office.description.substring(0, 200), // Limit length for API
          "business office description"
        );
        console.log(`  → ${arabicDesc.substring(0, 60)}...`);
      }
      
      // Update database
      await connection.query(
        "UPDATE sanad_offices SET officeNameAr = ?, descriptionAr = ? WHERE id = ?",
        [arabicName, arabicDesc, office.id]
      );
      
      updated++;
      console.log(`  ✓ Updated (${updated}/${offices.length})\n`);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`✅ Updated ${updated} office translations\n`);
  } catch (error) {
    console.error("❌ Error seeding office translations:", error);
  }
}

async function seedTemplateTranslations() {
  console.log("📄 Seeding template Arabic translations with LLM...\n");
  
  try {
    // Get all templates without Arabic names
    const [templates] = await connection.query(
      "SELECT id, templateName, description FROM document_templates WHERE templateNameAr IS NULL OR templateNameAr = '' OR templateNameAr LIKE '%(عربي)%'"
    );
    
    console.log(`Found ${templates.length} templates to translate\n`);
    let updated = 0;
    
    for (const template of templates) {
      console.log(`Translating: ${template.templateName}...`);
      
      // Translate template name
      const arabicName = await translateToArabic(template.templateName, "legal document template name");
      console.log(`  → ${arabicName}`);
      
      // Translate description if exists
      let arabicDesc = "نموذج مستند";
      if (template.description) {
        arabicDesc = await translateToArabic(
          template.description.substring(0, 200),
          "legal document template description"
        );
        console.log(`  → ${arabicDesc.substring(0, 60)}...`);
      }
      
      // Update database
      await connection.query(
        "UPDATE document_templates SET templateNameAr = ?, descriptionAr = ? WHERE id = ?",
        [arabicName, arabicDesc, template.id]
      );
      
      updated++;
      console.log(`  ✓ Updated (${updated}/${templates.length})\n`);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`✅ Updated ${updated} template translations\n`);
  } catch (error) {
    console.error("❌ Error seeding template translations:", error);
  }
}

async function main() {
  console.log("🚀 Starting enhanced Arabic content seeding with LLM translations...\n");
  console.log("This will take a few minutes depending on the number of records.\n");
  
  await seedOfficeTranslations();
  await seedTemplateTranslations();
  
  console.log("🎉 Enhanced Arabic content seeding complete!");
  await connection.end();
  process.exit(0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
