#!/usr/bin/env node

/**
 * Seed Sample Data for SmartPro Platform Testing
 * Creates realistic sample data for demonstration and testing
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

console.log('🌱 Starting sample data seeding...\n');

// Create database connection
const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

// Sample data definitions
const sampleUsers = [
  {
    openId: 'admin_001',
    name: 'Administrator Ali',
    email: 'admin@smartpro.om',
    role: 'admin',
    isActive: 1,
    mfaEnabled: 1,
  },
  {
    openId: 'owner_001',
    name: 'Mohammed Al-Balushi',
    email: 'mohammed.balushi@sanad.om',
    role: 'office_owner',
    isActive: 1,
    mfaEnabled: 1,
  },
  {
    openId: 'owner_002',
    name: 'Fatima Al-Hinai',
    email: 'fatima.hinai@services.om',
    role: 'office_owner',
    isActive: 1,
    mfaEnabled: 0,
  },
  {
    openId: 'customer_001',
    name: 'Ahmed Al-Rashdi',
    email: 'ahmed.rashdi@example.om',
    role: 'user',
    isActive: 1,
    mfaEnabled: 0,
  },
  {
    openId: 'customer_002',
    name: 'Sara Al-Mamari',
    email: 'sara.mamari@example.om',
    role: 'user',
    isActive: 1,
    mfaEnabled: 1,
  },
];

const sampleOffices = [
  {
    name: 'Muscat Business Services Center',
    nameAr: 'مركز خدمات الأعمال مسقط',
    description: 'Full-service business center offering company registration, legal documentation, and consulting services.',
    descriptionAr: 'مركز خدمات أعمال متكامل يقدم تسجيل الشركات والوثائق القانونية والخدمات الاستشارية',
    region: 'Muscat',
    address: 'Al Khuwair, Muscat, Oman',
    phone: '+968 24 123456',
    email: 'info@muscatbusiness.om',
    licenseNumber: 'LIC-2024-001',
    verificationStatus: 'verified',
    isActive: 1,
    rating: 4.8,
    reviewCount: 156,
  },
  {
    name: 'Salalah Legal Documentation Office',
    nameAr: 'مكتب صلالة للوثائق القانونية',
    description: 'Specialized in legal documentation, notarization, and translation services for businesses.',
    descriptionAr: 'متخصص في الوثائق القانونية والتوثيق وخدمات الترجمة للشركات',
    region: 'Dhofar',
    address: 'Al Hafah, Salalah, Oman',
    phone: '+968 23 987654',
    email: 'contact@salalah-legal.om',
    licenseNumber: 'LIC-2024-002',
    verificationStatus: 'verified',
    isActive: 1,
    rating: 4.6,
    reviewCount: 89,
  },
  {
    name: 'Sohar Business Hub',
    nameAr: 'مركز صحار للأعمال',
    description: 'One-stop shop for all business registration and licensing needs in the Batinah region.',
    descriptionAr: 'محطة واحدة لجميع احتياجات تسجيل الأعمال والترخيص في منطقة الباطنة',
    region: 'Al Batinah North',
    address: 'Sohar Industrial Area, Sohar, Oman',
    phone: '+968 26 555123',
    email: 'info@soharhub.om',
    licenseNumber: 'LIC-2024-003',
    verificationStatus: 'pending',
    isActive: 1,
    rating: 0,
    reviewCount: 0,
  },
  {
    name: 'Nizwa Corporate Services',
    nameAr: 'خدمات الشركات نزوى',
    description: 'Providing comprehensive corporate services including registration, accounting, and legal support.',
    descriptionAr: 'تقديم خدمات الشركات الشاملة بما في ذلك التسجيل والمحاسبة والدعم القانوني',
    region: 'Ad Dakhiliyah',
    address: 'Nizwa Souq Area, Nizwa, Oman',
    phone: '+968 25 444789',
    email: 'services@nizwacorp.om',
    licenseNumber: 'LIC-2024-004',
    verificationStatus: 'pending',
    isActive: 1,
    rating: 0,
    reviewCount: 0,
  },
  {
    name: 'Sur Maritime Business Center',
    nameAr: 'مركز الأعمال البحرية صور',
    description: 'Specialized services for maritime and shipping companies, including vessel registration.',
    descriptionAr: 'خدمات متخصصة لشركات الشحن البحري بما في ذلك تسجيل السفن',
    region: 'Ash Sharqiyah South',
    address: 'Sur Port Area, Sur, Oman',
    phone: '+968 25 777888',
    email: 'info@surmaritime.om',
    licenseNumber: 'LIC-2024-005',
    verificationStatus: 'verified',
    isActive: 1,
    rating: 4.9,
    reviewCount: 67,
  },
];

try {
  // 1. Create sample users
  console.log('👥 Creating sample users...');
  const createdUsers = [];
  for (const user of sampleUsers) {
    const [existingUser] = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.openId, user.openId))
      .limit(1);

    if (existingUser) {
      console.log(`   ⏭️  User ${user.name} already exists, skipping...`);
      createdUsers.push(existingUser);
    } else {
      const [newUser] = await db.insert(schema.user).values(user).$returningId();
      console.log(`   ✅ Created user: ${user.name} (${user.role})`);
      createdUsers.push({ id: newUser.id, ...user });
    }
  }

  // 2. Create sample offices
  console.log('\n🏢 Creating sample offices...');
  const createdOffices = [];
  for (let i = 0; i < sampleOffices.length; i++) {
    const office = sampleOffices[i];
    const ownerId = createdUsers[i % 2 + 1].id; // Assign to office owners

    const [existingOffice] = await db
      .select()
      .from(schema.sanadOffice)
      .where(eq(schema.sanadOffice.licenseNumber, office.licenseNumber))
      .limit(1);

    if (existingOffice) {
      console.log(`   ⏭️  Office ${office.name} already exists, skipping...`);
      createdOffices.push(existingOffice);
    } else {
      const [newOffice] = await db
        .insert(schema.sanadOffice)
        .values({ ...office, ownerId })
        .$returningId();
      console.log(`   ✅ Created office: ${office.name} (${office.verificationStatus})`);
      createdOffices.push({ id: newOffice.id, ...office, ownerId });
    }
  }

  // 3. Create sample services for verified offices
  console.log('\n📋 Creating sample services...');
  const serviceTypes = [
    { name: 'Company Registration', nameAr: 'تسجيل الشركة', price: 500, duration: 5 },
    { name: 'Trade License', nameAr: 'رخصة تجارية', price: 300, duration: 3 },
    { name: 'Legal Documentation', nameAr: 'وثائق قانونية', price: 150, duration: 2 },
    { name: 'Document Translation', nameAr: 'ترجمة المستندات', price: 50, duration: 1 },
    { name: 'Notarization Service', nameAr: 'خدمة التوثيق', price: 75, duration: 1 },
  ];

  let serviceCount = 0;
  for (const office of createdOffices) {
    if (office.verificationStatus === 'verified') {
      for (const service of serviceTypes) {
        await db.insert(schema.service).values({
          officeId: office.id,
          name: service.name,
          nameAr: service.nameAr,
          description: `Professional ${service.name.toLowerCase()} service`,
          descriptionAr: `خدمة ${service.nameAr} احترافية`,
          price: service.price,
          estimatedDuration: service.duration,
          isActive: 1,
        });
        serviceCount++;
      }
      console.log(`   ✅ Created ${serviceTypes.length} services for ${office.name}`);
    }
  }

  // 4. Create sample bookings
  console.log('\n📅 Creating sample bookings...');
  const bookingStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
  const bookingCount = 10;

  for (let i = 0; i < bookingCount; i++) {
    const customerId = createdUsers[3 + (i % 2)].id; // Customer users
    const verifiedOffices = createdOffices.filter(o => o.verificationStatus === 'verified');
    const office = verifiedOffices[i % verifiedOffices.length];
    
    // Get a service for this office
    const [service] = await db
      .select()
      .from(schema.service)
      .where(eq(schema.service.officeId, office.id))
      .limit(1);

    if (service) {
      const status = bookingStatuses[i % bookingStatuses.length];
      const bookingDate = new Date();
      bookingDate.setDate(bookingDate.getDate() + (i - 5)); // Mix of past and future

      await db.insert(schema.booking).values({
        userId: customerId,
        officeId: office.id,
        serviceId: service.id,
        bookingDate: bookingDate.toISOString(),
        status,
        notes: `Sample booking #${i + 1}`,
      });
      console.log(`   ✅ Created booking #${i + 1}: ${status} - ${office.name}`);
    }
  }

  // 5. Create sample service requests
  console.log('\n📝 Creating sample service requests...');
  for (let i = 0; i < 5; i++) {
    const customerId = createdUsers[3 + (i % 2)].id;
    const verifiedOffices = createdOffices.filter(o => o.verificationStatus === 'verified');
    const office = verifiedOffices[i % verifiedOffices.length];

    await db.insert(schema.serviceRequest).values({
      userId: customerId,
      officeId: office.id,
      requestType: i % 2 === 0 ? 'company_registration' : 'legal_documentation',
      status: i < 2 ? 'pending' : i < 4 ? 'in_progress' : 'completed',
      description: `Sample service request for ${i % 2 === 0 ? 'company registration' : 'legal documentation'}`,
    });
    console.log(`   ✅ Created service request #${i + 1}`);
  }

  // 6. Create sample document templates
  console.log('\n📄 Creating sample document templates...');
  const templates = [
    {
      name: 'Company Registration Form',
      nameAr: 'نموذج تسجيل الشركة',
      category: 'registration',
      description: 'Standard form for company registration in Oman',
    },
    {
      name: 'Trade License Application',
      nameAr: 'طلب رخصة تجارية',
      category: 'licensing',
      description: 'Application form for trade license',
    },
    {
      name: 'Power of Attorney',
      nameAr: 'توكيل رسمي',
      category: 'legal',
      description: 'Legal power of attorney document',
    },
  ];

  for (const template of templates) {
    const [existing] = await db
      .select()
      .from(schema.documentTemplate)
      .where(eq(schema.documentTemplate.name, template.name))
      .limit(1);

    if (!existing) {
      await db.insert(schema.documentTemplate).values({
        ...template,
        content: `# ${template.name}\n\nThis is a sample template for ${template.description}`,
        isActive: 1,
      });
      console.log(`   ✅ Created template: ${template.name}`);
    } else {
      console.log(`   ⏭️  Template ${template.name} already exists, skipping...`);
    }
  }

  console.log('\n✅ Sample data seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - Users: ${sampleUsers.length}`);
  console.log(`   - Offices: ${sampleOffices.length}`);
  console.log(`   - Services: ${serviceCount}`);
  console.log(`   - Bookings: ${bookingCount}`);
  console.log(`   - Service Requests: 5`);
  console.log(`   - Document Templates: ${templates.length}`);
  console.log('\n🎉 Platform is now populated with sample data for testing!\n');

} catch (error) {
  console.error('\n❌ Error seeding sample data:', error);
  process.exit(1);
} finally {
  await connection.end();
}
