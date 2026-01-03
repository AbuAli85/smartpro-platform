import { drizzle } from 'drizzle-orm/mysql2';
import { like, eq } from 'drizzle-orm';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.js';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

// Find Premium Legal Services office
const offices = await db.select().from(schema.sanadOffices)
  .where(like(schema.sanadOffices.officeName, '%Premium Legal%'))
  .limit(1);

if (offices.length === 0) {
  console.log('❌ Premium Legal Services office not found');
  process.exit(1);
}

const office = offices[0];
console.log(`✅ Found office: ${office.officeName} (ID: ${office.id})`);

// Check existing services
const existingServices = await db.select().from(schema.sanadOfficeServices)
  .where(eq(schema.sanadOfficeServices.officeId, office.id));

console.log(`📋 Existing services: ${existingServices.length}`);

// Services to add
const services = [
  {
    officeId: office.id,
    serviceName: 'Company Registration',
    serviceNameAr: 'تسجيل الشركات',
    description: 'Complete company registration services including CR, trade license, and all required documentation',
    descriptionAr: 'خدمات تسجيل الشركات الكاملة بما في ذلك السجل التجاري والرخصة التجارية وجميع الوثائق المطلوبة',
    category: 'legal',
    basePrice: 500.00,
    duration: 120,
    isActive: 1,
    requiresDocuments: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    officeId: office.id,
    serviceName: 'Legal Documentation',
    serviceNameAr: 'التوثيق القانوني',
    description: 'Professional legal documentation services for contracts, agreements, and official papers',
    descriptionAr: 'خدمات التوثيق القانوني المهنية للعقود والاتفاقيات والأوراق الرسمية',
    category: 'legal',
    basePrice: 150.00,
    duration: 60,
    isActive: 1,
    requiresDocuments: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    officeId: office.id,
    serviceName: 'Business License Renewal',
    serviceNameAr: 'تجديد الرخصة التجارية',
    description: 'Fast and efficient business license renewal services with full documentation support',
    descriptionAr: 'خدمات تجديد الرخصة التجارية السريعة والفعالة مع دعم كامل للوثائق',
    category: 'legal',
    basePrice: 200.00,
    duration: 90,
    isActive: 1,
    requiresDocuments: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    officeId: office.id,
    serviceName: 'Contract Review & Drafting',
    serviceNameAr: 'مراجعة وصياغة العقود',
    description: 'Expert contract review and drafting services for business agreements and legal documents',
    descriptionAr: 'خدمات مراجعة وصياغة العقود الخبيرة للاتفاقيات التجارية والوثائق القانونية',
    category: 'legal',
    basePrice: 300.00,
    duration: 120,
    isActive: 1,
    requiresDocuments: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    officeId: office.id,
    serviceName: 'Legal Consultation',
    serviceNameAr: 'الاستشارات القانونية',
    description: 'Professional legal consultation for business matters, compliance, and regulatory issues',
    descriptionAr: 'استشارات قانونية مهنية للمسائل التجارية والامتثال والقضايا التنظيمية',
    category: 'legal',
    basePrice: 100.00,
    duration: 60,
    isActive: 1,
    requiresDocuments: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Add services
let addedCount = 0;
for (const service of services) {
  // Check if service already exists
  const existing = existingServices.find(s => 
    s.serviceName === service.serviceName || s.serviceNameAr === service.serviceNameAr
  );
  
  if (existing) {
    console.log(`⏭️  Skipping existing service: ${service.serviceName}`);
    continue;
  }
  
  await db.insert(schema.sanadOfficeServices).values(service);
  console.log(`✅ Added service: ${service.serviceName} (${service.serviceNameAr})`);
  addedCount++;
}

console.log(`\n🎉 Successfully added ${addedCount} new services to ${office.officeName}`);

await connection.end();
