/**
 * Seed Arabic translations for existing offices and templates
 * Run with: node server/seedArabicContent.mjs
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

// Sample Arabic translations for common business terms
const arabicTranslations = {
  offices: [
    {
      englishName: "Al Waha Business Services",
      arabicName: "الواحة لخدمات الأعمال",
      englishDesc: "Professional business services and consulting",
      arabicDesc: "خدمات الأعمال المهنية والاستشارات"
    },
    {
      englishName: "Muscat Business Center",
      arabicName: "مركز مسقط للأعمال",
      englishDesc: "Complete business setup and licensing services",
      arabicDesc: "خدمات إنشاء وترخيص الأعمال الكاملة"
    },
    {
      englishName: "Oman Business Solutions",
      arabicName: "حلول الأعمال العمانية",
      englishDesc: "Comprehensive business support services",
      arabicDesc: "خدمات دعم الأعمال الشاملة"
    }
  ],
  templates: [
    {
      englishName: "Employment Contract",
      arabicName: "عقد عمل",
      englishDesc: "Standard employment agreement template",
      arabicDesc: "نموذج اتفاقية عمل قياسية"
    },
    {
      englishName: "NOC Certificate",
      arabicName: "شهادة عدم ممانعة",
      englishDesc: "No Objection Certificate for various purposes",
      arabicDesc: "شهادة عدم ممانعة لأغراض مختلفة"
    },
    {
      englishName: "Business License Application",
      arabicName: "طلب ترخيص تجاري",
      englishDesc: "Application form for business license",
      arabicDesc: "نموذج طلب للحصول على ترخيص تجاري"
    },
    {
      englishName: "Commercial Registration",
      arabicName: "السجل التجاري",
      englishDesc: "Commercial registration certificate template",
      arabicDesc: "نموذج شهادة السجل التجاري"
    }
  ]
};

async function seedOfficeTranslations() {
  console.log("🌍 Seeding office Arabic translations...");
  
  try {
    // Get all offices without Arabic names
    const [offices] = await connection.query(
      "SELECT id, officeName, description FROM sanad_offices WHERE officeNameAr IS NULL OR officeNameAr = ''"
    );
    
    let updated = 0;
    
    for (const office of offices) {
      // Try to find a matching translation
      const translation = arabicTranslations.offices.find(
        t => office.officeName.toLowerCase().includes(t.englishName.toLowerCase().split(' ')[0])
      );
      
      if (translation) {
        await connection.query(
          "UPDATE sanad_offices SET officeNameAr = ?, descriptionAr = ? WHERE id = ?",
          [translation.arabicName, translation.arabicDesc, office.id]
        );
        updated++;
        console.log(`  ✓ Updated office: ${office.officeName} → ${translation.arabicName}`);
      } else {
        // Generate generic Arabic translation
        const genericArabic = `${office.officeName} (عربي)`;
        const genericDesc = office.description ? `${office.description} (بالعربية)` : "خدمات الأعمال";
        
        await connection.query(
          "UPDATE sanad_offices SET officeNameAr = ?, descriptionAr = ? WHERE id = ?",
          [genericArabic, genericDesc, office.id]
        );
        updated++;
        console.log(`  ⚠ Generic translation for: ${office.officeName}`);
      }
    }
    
    console.log(`✅ Updated ${updated} office translations\n`);
  } catch (error) {
    console.error("❌ Error seeding office translations:", error);
  }
}

async function seedTemplateTranslations() {
  console.log("📄 Seeding template Arabic translations...");
  
  try {
    // Get all templates without Arabic names
    const [templates] = await connection.query(
      "SELECT id, templateName, description FROM document_templates WHERE templateNameAr IS NULL OR templateNameAr = ''"
    );
    
    let updated = 0;
    
    for (const template of templates) {
      // Try to find a matching translation
      const translation = arabicTranslations.templates.find(
        t => template.templateName.toLowerCase().includes(t.englishName.toLowerCase().split(' ')[0])
      );
      
      if (translation) {
        await connection.query(
          "UPDATE document_templates SET templateNameAr = ?, descriptionAr = ? WHERE id = ?",
          [translation.arabicName, translation.arabicDesc, template.id]
        );
        updated++;
        console.log(`  ✓ Updated template: ${template.templateName} → ${translation.arabicName}`);
      } else {
        // Generate generic Arabic translation
        const genericArabic = `${template.templateName} (عربي)`;
        const genericDesc = template.description ? `${template.description} (بالعربية)` : "نموذج مستند";
        
        await connection.query(
          "UPDATE document_templates SET templateNameAr = ?, descriptionAr = ? WHERE id = ?",
          [genericArabic, genericDesc, template.id]
        );
        updated++;
        console.log(`  ⚠ Generic translation for: ${template.templateName}`);
      }
    }
    
    console.log(`✅ Updated ${updated} template translations\n`);
  } catch (error) {
    console.error("❌ Error seeding template translations:", error);
  }
}

async function main() {
  console.log("🚀 Starting Arabic content seeding...\n");
  
  await seedOfficeTranslations();
  await seedTemplateTranslations();
  
  console.log("🎉 Arabic content seeding complete!");
  await connection.end();
  process.exit(0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
