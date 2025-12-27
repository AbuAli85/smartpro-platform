/**
 * DOCX Template Engine
 * 
 * Uses docxtemplater to generate professional documents from .docx templates
 * Supports placeholder replacement, Hijri dates, and Arabic text
 */

import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { storagePut } from '../storage';
import { getDualDateFormat, getCurrentDualDate } from './hijriConverter';

/**
 * Generate a document from a .docx template
 * 
 * @param templateBuffer - Buffer containing the .docx template file
 * @param data - Object with placeholder values (e.g., { employeeName: "Ahmed", salary: "1500" })
 * @param templateName - Name of the template for file naming
 * @returns Object with generated document URL and file key
 */
export async function generateDocumentFromTemplate(
  templateBuffer: Buffer,
  data: Record<string, any>,
  templateName: string
): Promise<{ url: string; fileKey: string }> {
  try {
    // Load the template
    const zip = new PizZip(templateBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => '', // Return empty string for null/undefined values
    });

    // Process data to add automatic Hijri dates
    const processedData = processDataWithHijriDates(data);

    // Replace placeholders
    doc.render(processedData);

    // Generate the document
    const buffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    // Upload to S3
    const timestamp = Date.now();
    const fileKey = `generated-documents/${timestamp}-${templateName}.docx`;
    const { url } = await storagePut(
      fileKey,
      buffer,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );

    return { url, fileKey };
  } catch (error: any) {
    console.error('Error generating document from template:', error);
    throw new Error(`Failed to generate document: ${error.message}`);
  }
}

/**
 * Process data to automatically add Hijri dates for any date fields
 * Adds additional fields with _hijri suffix
 */
function processDataWithHijriDates(data: Record<string, any>): Record<string, any> {
  const processed = { ...data };

  // Add current date in both formats if not provided
  if (!processed.currentDate) {
    const currentDates = getCurrentDualDate();
    processed.currentDate = currentDates.gregorianEnglish;
    processed.currentDateArabic = currentDates.gregorianArabic;
    processed.currentDateHijri = currentDates.hijriArabic;
    processed.currentDateHijriEnglish = currentDates.hijriEnglish;
    processed.currentDateCombined = currentDates.combined;
  }

  // Process all date fields
  Object.keys(data).forEach((key) => {
    if (key.toLowerCase().includes('date') && data[key] instanceof Date) {
      const dualDates = getDualDateFormat(data[key]);
      processed[`${key}Hijri`] = dualDates.hijriArabic;
      processed[`${key}HijriEnglish`] = dualDates.hijriEnglish;
      processed[`${key}Combined`] = dualDates.combined;
      processed[`${key}Arabic`] = dualDates.gregorianArabic;
      
      // Format the original date in English
      processed[key] = dualDates.gregorianEnglish;
    }
  });

  return processed;
}

/**
 * Validate that a template file is a valid .docx file
 */
export function validateTemplateFile(buffer: Buffer): boolean {
  try {
    const zip = new PizZip(buffer);
    // Check if it contains the required .docx structure
    const hasContentTypes = zip.file('[Content_Types].xml') !== null;
    const hasDocumentXml = zip.file('word/document.xml') !== null;
    return hasContentTypes && hasDocumentXml;
  } catch (error) {
    return false;
  }
}

/**
 * Extract placeholder variables from a .docx template
 * Returns array of placeholder names found in the template
 */
export function extractPlaceholders(buffer: Buffer): string[] {
  try {
    const zip = new PizZip(buffer);
    const doc = new Docxtemplater(zip);
    
    // Get the document XML
    const documentXml = zip.file('word/document.xml')?.asText() || '';
    
    // Extract placeholders using regex (matches {{variableName}})
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = documentXml.matchAll(regex);
    const placeholders = new Set<string>();
    
    for (const match of matches) {
      placeholders.add(match[1].trim());
    }
    
    return Array.from(placeholders);
  } catch (error) {
    console.error('Error extracting placeholders:', error);
    return [];
  }
}

/**
 * Generate sample data for template preview
 * Creates realistic sample values based on placeholder names
 */
export function generateSampleData(placeholders: string[]): Record<string, string> {
  const sampleData: Record<string, string> = {};
  
  const samples: Record<string, string> = {
    // Personal information
    employeeName: 'Ahmed Al-Said',
    employeeNameAr: 'أحمد السعيدي',
    customerName: 'Fatima Al-Balushi',
    customerNameAr: 'فاطمة البلوشي',
    name: 'Mohammed Al-Hinai',
    nameAr: 'محمد الهنائي',
    
    // Company information
    companyName: 'SmartPro Business Services LLC',
    companyNameAr: 'شركة سمارت برو للخدمات التجارية ش.م.م',
    officeName: 'Muscat Business Center',
    officeNameAr: 'مركز مسقط للأعمال',
    
    // Financial
    salary: '1,500.000 OMR',
    amount: '2,500.000 OMR',
    price: '750.000 OMR',
    
    // Identification
    civilId: '12345678',
    passportNumber: 'A1234567',
    commercialRegistration: 'CR-2024-001',
    taxRegistration: 'TAX-2024-001',
    
    // Contact
    email: 'info@smartpro.om',
    phone: '+968 9123 4567',
    address: 'Al Khuwair, Muscat, Sultanate of Oman',
    addressAr: 'الخوير، مسقط، سلطنة عمان',
    
    // Job information
    position: 'Senior Accountant',
    positionAr: 'محاسب أول',
    department: 'Finance Department',
    departmentAr: 'قسم المالية',
    
    // Dates (will be auto-processed)
    joiningDate: new Date('2020-01-15').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    issueDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    
    // Reference numbers
    referenceNumber: 'REF-2024-001',
    documentNumber: 'DOC-2024-001',
    certificateNumber: 'CERT-2024-001',
    
    // Purpose
    purpose: 'For bank account opening',
    purposeAr: 'لفتح حساب بنكي',
    reason: 'Employment verification',
    reasonAr: 'التحقق من التوظيف',
  };
  
  placeholders.forEach((placeholder) => {
    const key = placeholder.toLowerCase();
    
    // Try exact match first
    if (samples[placeholder]) {
      sampleData[placeholder] = samples[placeholder];
    }
    // Try lowercase match
    else if (samples[key]) {
      sampleData[placeholder] = samples[key];
    }
    // Generate based on pattern
    else if (key.includes('name')) {
      sampleData[placeholder] = key.includes('ar') ? 'أحمد السعيدي' : 'Ahmed Al-Said';
    } else if (key.includes('date')) {
      sampleData[placeholder] = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } else if (key.includes('salary') || key.includes('amount') || key.includes('price')) {
      sampleData[placeholder] = '1,500.000 OMR';
    } else if (key.includes('email')) {
      sampleData[placeholder] = 'info@smartpro.om';
    } else if (key.includes('phone')) {
      sampleData[placeholder] = '+968 9123 4567';
    } else {
      // Default sample value
      sampleData[placeholder] = `[${placeholder}]`;
    }
  });
  
  return sampleData;
}
