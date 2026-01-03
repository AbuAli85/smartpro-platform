import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.js';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

// Get the owner user (first user in the system)
const users = await db.select().from(schema.users).limit(1);

if (users.length === 0) {
  console.log('❌ No users found in the system');
  process.exit(1);
}

const owner = users[0];
console.log(`✅ Using owner: ${owner.name} (ID: ${owner.id})`);

// Check if a pending office already exists
const existingPending = await db.select().from(schema.sanadOffices)
  .where(eq(schema.sanadOffices.verificationStatus, 'pending_verification'))
  .limit(1);

if (existingPending.length > 0) {
  console.log(`⏭️  Pending office already exists: ${existingPending[0].officeName} (ID: ${existingPending[0].id})`);
  console.log(`   Status: ${existingPending[0].verificationStatus}`);
  await connection.end();
  process.exit(0);
}

// Create a test pending office registration
const pendingOffice = {
  officeName: 'Al Wadi Business Consultancy',
  officeNameAr: 'استشارات الوادي للأعمال',
  slug: 'al-wadi-business-consultancy-' + Date.now(),
  commercialRegistration: 'CR-TEST-' + Date.now(),
  tradeLicense: 'TL-TEST-' + Date.now(),
  taxRegistration: 'TAX-TEST-' + Date.now(),
  email: 'info@alwadi-consultancy.om',
  phone: '+968 9876 5432',
  whatsapp: '+968 9876 5432',
  website: 'https://alwadi-consultancy.om',
  governorate: 'Ad Dakhiliyah',
  wilayat: 'Nizwa',
  addressLine1: 'Building 15, Al Wadi Street',
  addressLine2: 'Near Nizwa Souq',
  postalCode: '611',
  locationLat: '22.9333',
  locationLng: '57.5333',
  description: 'Professional business consultancy services specializing in company formation, business planning, and regulatory compliance. We help entrepreneurs and businesses navigate the Omani business landscape with expert guidance and comprehensive support.',
  descriptionAr: 'خدمات استشارات الأعمال المهنية المتخصصة في تأسيس الشركات وتخطيط الأعمال والامتثال التنظيمي. نساعد رواد الأعمال والشركات على التنقل في مشهد الأعمال العماني بتوجيه خبير ودعم شامل.',
  yearEstablished: 2020,
  employeeCount: 8,
  status: 'pending',
  verificationStatus: 'pending_verification',
  ownerId: owner.id,
  acceptsOnlineBookings: 1,
  autoAcceptBookings: 0,
  workingHours: JSON.stringify({
    sunday: { open: '08:00', close: '17:00', isOpen: true },
    monday: { open: '08:00', close: '17:00', isOpen: true },
    tuesday: { open: '08:00', close: '17:00', isOpen: true },
    wednesday: { open: '08:00', close: '17:00', isOpen: true },
    thursday: { open: '08:00', close: '13:00', isOpen: true },
    friday: { isOpen: false },
    saturday: { isOpen: false }
  }),
  logoUrl: null,
  coverImageUrl: null,
  images: null,
  totalOrders: 0,
  completedOrders: 0,
  averageRating: '0.00',
  totalReviews: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: owner.id,
  updatedBy: owner.id,
  cancellationWindowHours: 24,
  cancellationPenaltyPercent: 10,
  licenseDocumentUrl: null,
  certificateUrls: null,
  permitUrls: null,
  licenseExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
  tradeLicenseExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  taxRegistrationExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  performanceScore: '0',
  performanceRank: 0
};

const result = await db.insert(schema.sanadOffices).values(pendingOffice);
console.log(`✅ Created pending office: ${pendingOffice.officeName}`);
console.log(`   Office ID: ${result[0].insertId}`);
console.log(`   Verification Status: ${pendingOffice.verificationStatus}`);
console.log(`   Location: ${pendingOffice.wilayat}, ${pendingOffice.governorate}`);
console.log(`\n🎯 This office can now be used to demonstrate the government oversight capability`);
console.log(`   (office verification approval workflow) during your presentation.`);

await connection.end();
