/**
 * Update Document Templates to Follow Official Omani Government Format
 * - Adds proper headers with ministry/authority references
 * - Includes both Hijri and Gregorian dates
 * - Adds official stamp and signature sections
 * - Uses formal Arabic legal terminology
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { documentTemplates } from "../drizzle/schema.ts";
import { eq } from "drizzle-orm";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

// Official template updates with proper Omani government format
const templateUpdates = [
  {
    name: "Salary Certificate",
    templateContent: `
╔══════════════════════════════════════════════════════════════╗
║                    SALARY CERTIFICATE                         ║
║                      شهادة راتب                              ║
╚══════════════════════════════════════════════════════════════╝

{{companyName}}
{{companyNameAr}}
Commercial Registration No.: {{companyRegistration}}
السجل التجاري رقم: {{companyRegistration}}

Reference No.: {{referenceNumber}}
رقم المرجع: {{referenceNumber}}

Date (Gregorian): {{issueDate}}
Date (Hijri): {{hijriDate}}
التاريخ (ميلادي): {{issueDate}}
التاريخ (هجري): {{hijriDate}}

═══════════════════════════════════════════════════════════════

TO WHOM IT MAY CONCERN
إلى من يهمه الأمر

This is to certify that the following employee is currently employed with our organization:

نشهد بأن الموظف التالي يعمل حالياً لدى مؤسستنا:

EMPLOYEE INFORMATION / معلومات الموظف:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Full Name / الاسم الكامل: {{employeeName}}
Civil ID No. / الرقم المدني: {{employeeCivilId}}
Passport No. / رقم الجواز: {{passportNumber}}
Nationality / الجنسية: {{nationality}}
Position / المسمى الوظيفي: {{position}}
Date of Joining / تاريخ الالتحاق: {{joiningDate}}
Employment Type / نوع التوظيف: {{employmentType}}

SALARY DETAILS / تفاصيل الراتب:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Basic Salary / الراتب الأساسي: {{basicSalary}} OMR
Housing Allowance / بدل السكن: {{housingAllowance}} OMR
Transport Allowance / بدل المواصلات: {{transportAllowance}} OMR
Other Allowances / بدلات أخرى: {{otherAllowances}} OMR
─────────────────────────────────────────────────────────────
TOTAL MONTHLY SALARY / إجمالي الراتب الشهري: {{totalSalary}} OMR
═════════════════════════════════════════════════════════════

Purpose of Certificate / الغرض من الشهادة: {{purpose}}

This certificate is issued upon the employee's request for official use only.
صدرت هذه الشهادة بناءً على طلب الموظف للاستخدام الرسمي فقط.

═══════════════════════════════════════════════════════════════

AUTHORIZED SIGNATORY / المفوض بالتوقيع:

Name / الاسم: {{signatoryName}}
Position / المنصب: {{signatoryPosition}}

Signature / التوقيع: _______________________

Date / التاريخ: _______________________

                    [COMPANY STAMP]
                    [ختم الشركة]

═══════════════════════════════════════════════════════════════
Note: This is an official document. Any alteration or forgery is a criminal offense.
ملاحظة: هذه وثيقة رسمية. أي تغيير أو تزوير يعتبر جريمة جنائية.
`,
    variables: [
      { name: "companyName", label: "Company Name (English)", labelAr: "اسم الشركة (إنجليزي)", type: "text", required: true },
      { name: "companyNameAr", label: "Company Name (Arabic)", labelAr: "اسم الشركة (عربي)", type: "text", required: true },
      { name: "companyRegistration", label: "Commercial Registration No.", labelAr: "رقم السجل التجاري", type: "text", required: true },
      { name: "referenceNumber", label: "Reference Number", labelAr: "رقم المرجع", type: "text", required: true, placeholder: "e.g., SC/2025/001" },
      { name: "issueDate", label: "Issue Date (Gregorian)", labelAr: "تاريخ الإصدار (ميلادي)", type: "date", required: true },
      { name: "hijriDate", label: "Issue Date (Hijri)", labelAr: "تاريخ الإصدار (هجري)", type: "text", required: true, placeholder: "e.g., 15 Jumada II 1446" },
      { name: "employeeName", label: "Employee Full Name", labelAr: "الاسم الكامل للموظف", type: "text", required: true },
      { name: "employeeCivilId", label: "Civil ID No.", labelAr: "الرقم المدني", type: "text", required: true },
      { name: "passportNumber", label: "Passport Number", labelAr: "رقم الجواز", type: "text", required: true },
      { name: "nationality", label: "Nationality", labelAr: "الجنسية", type: "text", required: true },
      { name: "position", label: "Position", labelAr: "المسمى الوظيفي", type: "text", required: true },
      { name: "joiningDate", label: "Date of Joining", labelAr: "تاريخ الالتحاق", type: "date", required: true },
      { name: "employmentType", label: "Employment Type", labelAr: "نوع التوظيف", type: "dropdown", required: true, options: ["Permanent / دائم", "Contract / عقد", "Part-time / دوام جزئي"] },
      { name: "basicSalary", label: "Basic Salary (OMR)", labelAr: "الراتب الأساسي (ريال عماني)", type: "number", required: true },
      { name: "housingAllowance", label: "Housing Allowance (OMR)", labelAr: "بدل السكن (ريال عماني)", type: "number", required: false, defaultValue: "0" },
      { name: "transportAllowance", label: "Transport Allowance (OMR)", labelAr: "بدل المواصلات (ريال عماني)", type: "number", required: false, defaultValue: "0" },
      { name: "otherAllowances", label: "Other Allowances (OMR)", labelAr: "بدلات أخرى (ريال عماني)", type: "number", required: false, defaultValue: "0" },
      { name: "totalSalary", label: "Total Monthly Salary (OMR)", labelAr: "إجمالي الراتب الشهري (ريال عماني)", type: "number", required: true },
      { name: "purpose", label: "Purpose of Certificate", labelAr: "الغرض من الشهادة", type: "text", required: true },
      { name: "signatoryName", label: "Authorized Signatory Name", labelAr: "اسم المفوض بالتوقيع", type: "text", required: true },
      { name: "signatoryPosition", label: "Signatory Position", labelAr: "منصب المفوض", type: "text", required: true },
    ],
  },
  {
    name: "NOC for Bank Account Opening",
    templateContent: `
╔══════════════════════════════════════════════════════════════╗
║         NO OBJECTION CERTIFICATE - BANK ACCOUNT              ║
║           شهادة عدم ممانعة - فتح حساب بنكي                   ║
╚══════════════════════════════════════════════════════════════╝

{{companyName}}
{{companyNameAr}}
Commercial Registration No.: {{companyRegistration}}
السجل التجاري رقم: {{companyRegistration}}

Reference No.: {{referenceNumber}}
رقم المرجع: {{referenceNumber}}

Date (Gregorian): {{issueDate}}
Date (Hijri): {{hijriDate}}
التاريخ (ميلادي): {{issueDate}}
التاريخ (هجري): {{hijriDate}}

═══════════════════════════════════════════════════════════════

To: {{bankName}}
إلى: {{bankName}}

Subject: No Objection Certificate for Bank Account Opening
الموضوع: شهادة عدم ممانعة لفتح حساب بنكي

═══════════════════════════════════════════════════════════════

Dear Sir/Madam,
السيد المحترم / السيدة المحترمة،

This is to certify that we have NO OBJECTION to our employee opening a bank account with your esteemed institution.

نشهد بأنه ليس لدينا أي ممانعة لقيام موظفنا بفتح حساب بنكي لدى مؤسستكم الموقرة.

EMPLOYEE INFORMATION / معلومات الموظف:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Full Name / الاسم الكامل: {{employeeName}}
Civil ID No. / الرقم المدني: {{employeeCivilId}}
Passport No. / رقم الجواز: {{passportNumber}}
Nationality / الجنسية: {{nationality}}
Position / المسمى الوظيفي: {{position}}
Monthly Salary / الراتب الشهري: {{monthlySalary}} OMR

ACCOUNT TYPE REQUESTED / نوع الحساب المطلوب:
{{accountType}}

The employee is currently employed with us in good standing and has no pending obligations with the company.

الموظف يعمل حالياً لدينا بوضع جيد وليس عليه أي التزامات معلقة مع الشركة.

We have no objection to the opening of the requested bank account.
ليس لدينا أي ممانعة لفتح الحساب البنكي المطلوب.

═══════════════════════════════════════════════════════════════

AUTHORIZED SIGNATORY / المفوض بالتوقيع:

Name / الاسم: {{signatoryName}}
Position / المنصب: {{signatoryPosition}}
Contact Number / رقم الاتصال: {{contactNumber}}

Signature / التوقيع: _______________________

Date / التاريخ: _______________________

                    [COMPANY STAMP]
                    [ختم الشركة]

═══════════════════════════════════════════════════════════════
Note: This certificate is valid for 30 days from the date of issue.
ملاحظة: هذه الشهادة صالحة لمدة 30 يوماً من تاريخ الإصدار.
`,
    variables: [
      { name: "companyName", label: "Company Name (English)", labelAr: "اسم الشركة (إنجليزي)", type: "text", required: true },
      { name: "companyNameAr", label: "Company Name (Arabic)", labelAr: "اسم الشركة (عربي)", type: "text", required: true },
      { name: "companyRegistration", label: "Commercial Registration No.", labelAr: "رقم السجل التجاري", type: "text", required: true },
      { name: "referenceNumber", label: "Reference Number", labelAr: "رقم المرجع", type: "text", required: true, placeholder: "e.g., NOC/BA/2025/001" },
      { name: "issueDate", label: "Issue Date (Gregorian)", labelAr: "تاريخ الإصدار (ميلادي)", type: "date", required: true },
      { name: "hijriDate", label: "Issue Date (Hijri)", labelAr: "تاريخ الإصدار (هجري)", type: "text", required: true, placeholder: "e.g., 15 Jumada II 1446" },
      { name: "bankName", label: "Bank Name", labelAr: "اسم البنك", type: "text", required: true },
      { name: "employeeName", label: "Employee Full Name", labelAr: "الاسم الكامل للموظف", type: "text", required: true },
      { name: "employeeCivilId", label: "Civil ID No.", labelAr: "الرقم المدني", type: "text", required: true },
      { name: "passportNumber", label: "Passport Number", labelAr: "رقم الجواز", type: "text", required: true },
      { name: "nationality", label: "Nationality", labelAr: "الجنسية", type: "text", required: true },
      { name: "position", label: "Position", labelAr: "المسمى الوظيفي", type: "text", required: true },
      { name: "monthlySalary", label: "Monthly Salary (OMR)", labelAr: "الراتب الشهري (ريال عماني)", type: "number", required: true },
      { name: "accountType", label: "Account Type", labelAr: "نوع الحساب", type: "dropdown", required: true, options: ["Savings Account / حساب توفير", "Current Account / حساب جاري", "Salary Account / حساب راتب"] },
      { name: "signatoryName", label: "Authorized Signatory Name", labelAr: "اسم المفوض بالتوقيع", type: "text", required: true },
      { name: "signatoryPosition", label: "Signatory Position", labelAr: "منصب المفوض", type: "text", required: true },
      { name: "contactNumber", label: "Contact Number", labelAr: "رقم الاتصال", type: "phone", required: true },
    ],
  },
];

console.log("Starting template updates...");

for (const update of templateUpdates) {
  try {
    const result = await db
      .update(documentTemplates)
      .set({
        templateContent: update.templateContent,
        variables: JSON.stringify(update.variables),
        updatedAt: new Date(),
      })
      .where(eq(documentTemplates.templateName, update.name));
    
    console.log(`✓ Updated: ${update.name}`);
  } catch (error) {
    console.error(`✗ Failed to update ${update.name}:`, error.message);
  }
}

await connection.end();
console.log("Template updates completed!");
