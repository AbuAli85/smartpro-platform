/**
 * Simplified Demo Data Seeding Script
 * Uses existing database helper functions
 * 
 * Run with: npx tsx scripts/seed-demo-simple.ts
 */

import { getDb } from '../server/db';
import { eq } from 'drizzle-orm';
import { 
  users, 
  sanadOffices, 
  sanadOfficeServices, 
  officeAvailability,
  bookings,
  serviceRequests,
  serviceBids,
  reviews
} from '../drizzle/schema';

async function seedDemoData() {
  console.log('🌱 Starting simplified demo data seeding...\n');

  const db = await getDb();
  if (!db) {
    throw new Error('Failed to connect to database');
  }

  try {
    // 1. Create demo users
    console.log('👥 Creating demo users...');
    
    const demoUsers = [
      { openId: 'demo_sme_1', name: 'Ahmed Al-Balushi', email: 'ahmed@example.com', role: 'user' as const, phone: '+96891234567' },
      { openId: 'demo_sme_2', name: 'Fatima Al-Lawati', email: 'fatima@example.com', role: 'user' as const, phone: '+96891234568' },
      { openId: 'demo_owner_1', name: 'Mohammed Al-Harthi', email: 'mohammed@sanad.om', role: 'sanad_owner' as const, phone: '+96891234569' },
      { openId: 'demo_owner_2', name: 'Aisha Al-Kindi', email: 'aisha@sanad.om', role: 'sanad_owner' as const, phone: '+96891234570' },
      { openId: 'demo_owner_3', name: 'Salem Al-Rashdi', email: 'salem@sanad.om', role: 'sanad_owner' as const, phone: '+96891234571' }
    ];

    for (const userData of demoUsers) {
      await db.insert(users).values({
        ...userData,
        preferredLanguage: 'ar',
        lastSignedIn: new Date(),
        createdAt: new Date()
      }).onDuplicateKeyUpdate({ set: { name: userData.name } });
    }
    console.log(`   ✓ Created ${demoUsers.length} demo users`);

    // Get created users
    const createdUsers = await db.select().from(users).where(eq(users.openId, demoUsers[0].openId)).limit(5);
    
    // 2. Create demo offices
    console.log('\n🏢 Creating demo Sanad offices...');
    
    const offices = [
      {
        officeName: 'Muscat Business Services',
        officeNameAr: 'مركز مسقط لخدمات الأعمال',
        slug: 'muscat-business-services',
        commercialRegistration: 'CR-MSC-001',
        tradeLicense: 'TL-MSC-001',
        taxRegistration: 'TAX-MSC-001',
        description: 'Full-service business center in Muscat',
        descriptionAr: 'مركز خدمات أعمال متكامل في مسقط',
        governorate: 'Muscat',
        wilayat: 'Muscat',
        addressLine1: 'Al Khuwair, Building 234',
        phone: '+96824567890',
        email: 'info@muscatbusiness.om',
        verificationStatus: 'verified' as const,
        isActive: true,
        rating: '4.8',
        totalReviews: 127,
        completedBookings: 543
      },
      {
        officeName: 'Salalah Legal Consultancy',
        officeNameAr: 'مكتب صلالة للاستشارات القانونية',
        slug: 'salalah-legal-consultancy',
        commercialRegistration: 'CR-SLL-002',
        tradeLicense: 'TL-SLL-002',
        taxRegistration: 'TAX-SLL-002',
        description: 'Expert legal services in Dhofar',
        descriptionAr: 'خدمات قانونية متخصصة في ظفار',
        governorate: 'Dhofar',
        wilayat: 'Salalah',
        addressLine1: 'Al Dahariz, Floor 2',
        phone: '+96823456789',
        email: 'contact@salalahconsult.om',
        verificationStatus: 'verified' as const,
        isActive: true,
        rating: '4.9',
        totalReviews: 89,
        completedBookings: 312
      },
      {
        officeName: 'Sohar Business Hub',
        officeNameAr: 'مركز صحار للأعمال',
        slug: 'sohar-business-hub',
        commercialRegistration: 'CR-SHR-003',
        tradeLicense: 'TL-SHR-003',
        taxRegistration: 'TAX-SHR-003',
        description: 'Business registration in North Batinah',
        descriptionAr: 'تسجيل الأعمال في شمال الباطنة',
        governorate: 'Al Batinah North',
        wilayat: 'Sohar',
        addressLine1: 'Sohar Industrial Area',
        phone: '+96826789012',
        email: 'info@soharhub.om',
        verificationStatus: 'verified' as const,
        isActive: true,
        rating: '4.7',
        totalReviews: 64,
        completedBookings: 198
      }
    ];

    for (let i = 0; i < offices.length; i++) {
      const officeData = offices[i];
      const owner = await db.select().from(users).where(eq(users.openId, `demo_owner_${i + 1}`)).limit(1);
      
      if (owner[0]) {
        await db.insert(sanadOffices).values({
          ...officeData,
          ownerId: owner[0].id,
          createdAt: new Date()
        });
        console.log(`   ✓ Created office: ${officeData.officeName}`);
      }
    }

    console.log('\n✅ Demo data seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - ${demoUsers.length} demo users created`);
    console.log(`   - ${offices.length} Sanad offices created`);
    console.log('\n🎉 Platform is now ready for demonstration!\n');

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    throw error;
  }
}

// Run the seeding script
seedDemoData()
  .then(() => {
    console.log('Seeding script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding script failed:', error);
    process.exit(1);
  });
