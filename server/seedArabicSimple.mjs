/**
 * Simplified Arabic content seeding using existing translation helper
 * Run with: node server/seedArabicSimple.mjs
 */

import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Enhanced professional Arabic translations for business terms
const simpleTranslations = {
  // Office names
  "Test Office for Filters": "مكتب اختبار الفلاتر",
  "Muscat Business Center": "مركز مسقط للأعمال",
  "Salalah Trade Office": "مكتب صلالة التجاري",
  "Sohar Commercial Hub": "مركز صحار التجاري",
  "Nizwa Services Office": "مكتب خدمات نزوى",
  "Sur Business Solutions": "حلول الأعمال صور",
  "Ibri Professional Services": "الخدمات المهنية عبري",
  "Barka Trade Center": "مركز بركاء التجاري",
  "Rustaq Business Hub": "مركز الرستاق للأعمال",
  "Buraimi Commercial Office": "المكتب التجاري البريمي",
  
  // Business descriptions
  "Professional business services": "خدمات الأعمال المهنية",
  "Comprehensive business support": "دعم شامل للأعمال",
  "Expert business consultation": "استشارات الأعمال المتخصصة",
  "Full-service business center": "مركز خدمات الأعمال المتكامل",
  "Business registration and licensing": "تسجيل الأعمال والترخيص",
  "Certified business services provider": "مزود خدمات الأعمال المعتمد",
  "Trusted business partner": "شريك الأعمال الموثوق",
  "One-stop business solutions": "حلول الأعمال المتكاملة",
  "Government-approved services": "خدمات معتمدة حكوميًا",
  "Fast and reliable service": "خدمة سريعة وموثوقة",
  
  // Document templates
  "Commercial Registration": "السجل التجاري",
  "Business License": "رخصة تجارية",
  "Tax Registration": "التسجيل الضريبي",
  "Employment Contract": "عقد عمل",
  "Partnership Agreement": "اتفاقية شراكة",
  "Power of Attorney": "توكيل رسمي",
  "Company Formation": "تأسيس شركة",
  "Legal Documents": "مستندات قانونية",
  "Articles of Association": "عقد التأسيس",
  "Memorandum of Understanding": "مذكرة تفاهم",
  "Board Resolution": "قرار مجلس الإدارة",
  "Shareholder Agreement": "اتفاقية المساهمين",
  "Non-Disclosure Agreement": "اتفاقية عدم الإفصاح",
  "Service Agreement": "اتفاقية خدمة",
  "Lease Agreement": "عقد إيجار",
  "Sales Contract": "عقد بيع",
  "Purchase Order": "أمر شراء",
  "Invoice": "فاتورة",
  "Receipt": "إيصال",
  
  // Service categories
  "Company Registration": "تسجيل الشركات",
  "Licensing Services": "خدمات التراخيص",
  "Legal Consultation": "الاستشارات القانونية",
  "Document Attestation": "تصديق المستندات",
  "Visa Services": "خدمات التأشيرات",
  "PRO Services": "خدمات العلاقات العامة",
  "Accounting Services": "خدمات المحاسبة",
  "Audit Services": "خدمات التدقيق",
  "Tax Services": "الخدمات الضريبية",
  "HR Services": "خدمات الموارد البشرية",
  "Business Consulting": "استشارات الأعمال",
  "Market Research": "بحوث السوق",
  "Business Planning": "تخطيط الأعمال",
  "Financial Advisory": "الاستشارات المالية",
  "Corporate Services": "الخدمات المؤسسية",
  "Trade License": "الرخصة التجارية",
  "Industrial License": "الرخصة الصناعية",
  "Professional License": "الرخصة المهنية",
};

function getSimpleTranslation(text) {
  // Check exact match first
  if (simpleTranslations[text]) {
    return simpleTranslations[text];
  }
  
  // Check if text contains any known terms
  for (const [en, ar] of Object.entries(simpleTranslations)) {
    if (text.toLowerCase().includes(en.toLowerCase())) {
      return ar;
    }
  }
  
  // Fallback: keep original with Arabic marker
  return `${text} (عربي)`;
}

async function seedOfficeTranslations() {
  console.log("🌍 Seeding office Arabic translations...\n");
  
  try {
    // Get all offices without proper Arabic names
    const [offices] = await connection.query(
      "SELECT id, officeName, description FROM sanad_offices WHERE officeNameAr IS NULL OR officeNameAr = '' OR officeNameAr LIKE '%(عربي)%'"
    );
    
    console.log(`Found ${offices.length} offices to translate\n`);
    let updated = 0;
    
    for (const office of offices) {
      console.log(`Translating: ${office.officeName}...`);
      
      const arabicName = getSimpleTranslation(office.officeName);
      console.log(`  → ${arabicName}`);
      
      const arabicDesc = office.description 
        ? getSimpleTranslation(office.description)
        : "خدمات الأعمال المهنية";
      
      // Update database
      await connection.query(
        "UPDATE sanad_offices SET officeNameAr = ?, descriptionAr = ? WHERE id = ?",
        [arabicName, arabicDesc, office.id]
      );
      
      updated++;
      console.log(`  ✓ Updated (${updated}/${offices.length})\n`);
    }
    
    console.log(`✅ Updated ${updated} office translations\n`);
  } catch (error) {
    console.error("❌ Error seeding office translations:", error);
  }
}

async function seedTemplateTranslations() {
  console.log("📄 Seeding template Arabic translations...\n");
  
  try {
    // Get all templates without proper Arabic names
    const [templates] = await connection.query(
      "SELECT id, templateName, description FROM document_templates WHERE templateNameAr IS NULL OR templateNameAr = '' OR templateNameAr LIKE '%(عربي)%'"
    );
    
    console.log(`Found ${templates.length} templates to translate\n`);
    let updated = 0;
    
    for (const template of templates) {
      console.log(`Translating: ${template.templateName}...`);
      
      const arabicName = getSimpleTranslation(template.templateName);
      console.log(`  → ${arabicName}`);
      
      const arabicDesc = template.description
        ? getSimpleTranslation(template.description)
        : "نموذج مستند";
      
      // Update database
      await connection.query(
        "UPDATE document_templates SET templateNameAr = ?, descriptionAr = ? WHERE id = ?",
        [arabicName, arabicDesc, template.id]
      );
      
      updated++;
      console.log(`  ✓ Updated (${updated}/${templates.length})\n`);
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
