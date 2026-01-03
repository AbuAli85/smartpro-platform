/**
 * Comprehensive Demo Data Seeding Script
 * Creates realistic sample data to showcase platform capabilities
 * 
 * Run with: npx tsx scripts/seed-demo-data.ts
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
  reviews,
  documentTemplates,
  generatedDocuments,
  chatConversations,
  chatMessages,
  loyaltyTransactions,
  notifications
} from '../drizzle/schema';
import { eq } from 'drizzle-orm';

// Demo user credentials
const DEMO_USERS = [
  {
    openId: 'demo_sme_owner_1',
    name: 'Ahmed Al-Balushi',
    email: 'ahmed.balushi@example.com',
    role: 'user' as const,
    preferredLanguage: 'ar' as const,
    phone: '+96891234567'
  },
  {
    openId: 'demo_sme_owner_2',
    name: 'Fatima Al-Lawati',
    email: 'fatima.lawati@example.com',
    role: 'user' as const,
    preferredLanguage: 'ar' as const,
    phone: '+96891234568'
  },
  {
    openId: 'demo_office_owner_1',
    name: 'Mohammed Al-Harthi',
    email: 'mohammed.harthi@sanad.om',
    role: 'sanad_owner' as const,
    preferredLanguage: 'ar' as const,
    phone: '+96891234569'
  },
  {
    openId: 'demo_office_owner_2',
    name: 'Aisha Al-Kindi',
    email: 'aisha.kindi@sanad.om',
    role: 'sanad_owner' as const,
    preferredLanguage: 'ar' as const,
    phone: '+96891234570'
  },
  {
    openId: 'demo_office_owner_3',
    name: 'Salem Al-Rashdi',
    email: 'salem.rashdi@sanad.om',
    role: 'sanad_owner' as const,
    preferredLanguage: 'en' as const,
    phone: '+96891234571'
  }
];

// Demo Sanad Offices
const DEMO_OFFICES = [
  {
    officeName: 'Muscat Business Services Center',
    officeNameAr: 'مركز مسقط لخدمات الأعمال',
    description: 'Full-service business center specializing in company registration, tax services, and legal documentation. Serving Muscat businesses for over 10 years.',
    descriptionAr: 'مركز خدمات أعمال متكامل متخصص في تسجيل الشركات والخدمات الضريبية والوثائق القانونية. نخدم شركات مسقط منذ أكثر من 10 سنوات.',
    governorate: 'Muscat',
    wilayat: 'Muscat',
    address: 'Al Khuwair, Building 234, Office 12',
    phone: '+96824567890',
    email: 'info@muscatbusiness.om',
    website: 'https://muscatbusiness.om',
    logoUrl: '/placeholder-logo.png',
    coverImageUrl: '/placeholder-cover.png',
    verificationStatus: 'verified' as const,
    isActive: true,
    rating: '4.8',
    totalReviews: 127,
    completedBookings: 543,
    cancellationWindow: 48,
    cancellationPenaltyPercent: 20
  },
  {
    officeName: 'Salalah Legal & Tax Consultancy',
    officeNameAr: 'مكتب صلالة للاستشارات القانونية والضريبية',
    description: 'Expert legal and tax advisory services for businesses in Dhofar region. Specialized in VAT registration and compliance.',
    descriptionAr: 'خدمات استشارية قانونية وضريبية متخصصة للشركات في منطقة ظفار. متخصصون في تسجيل ضريبة القيمة المضافة والامتثال.',
    governorate: 'Dhofar',
    wilayat: 'Salalah',
    address: 'Al Dahariz, Commercial Complex, Floor 2',
    phone: '+96823456789',
    email: 'contact@salalahconsult.om',
    website: 'https://salalahconsult.om',
    logoUrl: '/placeholder-logo.png',
    coverImageUrl: '/placeholder-cover.png',
    verificationStatus: 'verified' as const,
    isActive: true,
    rating: '4.9',
    totalReviews: 89,
    completedBookings: 312,
    cancellationWindow: 24,
    cancellationPenaltyPercent: 15
  },
  {
    officeName: 'Sohar Business Hub',
    officeNameAr: 'مركز صحار للأعمال',
    description: 'One-stop shop for all business registration and licensing needs in North Batinah. Fast, reliable, and affordable.',
    descriptionAr: 'محطة واحدة لجميع احتياجات تسجيل الأعمال والترخيص في شمال الباطنة. سريع وموثوق وبأسعار معقولة.',
    governorate: 'Al Batinah North',
    wilayat: 'Sohar',
    address: 'Sohar Industrial Area, Gate 3',
    phone: '+96826789012',
    email: 'info@soharhub.om',
    website: 'https://soharhub.om',
    logoUrl: '/placeholder-logo.png',
    coverImageUrl: '/placeholder-cover.png',
    verificationStatus: 'verified' as const,
    isActive: true,
    rating: '4.7',
    totalReviews: 64,
    completedBookings: 198,
    cancellationWindow: 48,
    cancellationPenaltyPercent: 25
  },
  {
    officeName: 'Nizwa Heritage Business Services',
    officeNameAr: 'خدمات نزوى التراثية للأعمال',
    description: 'Traditional values, modern services. Helping Dakhliyah businesses thrive with comprehensive business support.',
    descriptionAr: 'قيم تقليدية، خدمات حديثة. نساعد شركات الداخلية على الازدهار بدعم أعمال شامل.',
    governorate: 'Ad Dakhiliyah',
    wilayat: 'Nizwa',
    address: 'Nizwa Souq Area, Near Nizwa Fort',
    phone: '+96825678901',
    email: 'services@nizwaheritage.om',
    website: 'https://nizwaheritage.om',
    logoUrl: '/placeholder-logo.png',
    coverImageUrl: '/placeholder-cover.png',
    verificationStatus: 'verified' as const,
    isActive: true,
    rating: '4.6',
    totalReviews: 45,
    completedBookings: 156,
    cancellationWindow: 24,
    cancellationPenaltyPercent: 10
  },
  {
    officeName: 'Sur Coastal Business Center',
    officeNameAr: 'مركز صور الساحلي للأعمال',
    description: 'Serving the coastal business community with maritime business registration, fishing licenses, and trade documentation.',
    descriptionAr: 'نخدم مجتمع الأعمال الساحلي بتسجيل الأعمال البحرية وتراخيص الصيد ووثائق التجارة.',
    governorate: 'Ash Sharqiyah South',
    wilayat: 'Sur',
    address: 'Sur Corniche, Marina Building',
    phone: '+96825567890',
    email: 'info@surcoastal.om',
    website: 'https://surcoastal.om',
    logoUrl: '/placeholder-logo.png',
    coverImageUrl: '/placeholder-cover.png',
    verificationStatus: 'verified' as const,
    isActive: true,
    rating: '4.5',
    totalReviews: 38,
    completedBookings: 124,
    cancellationWindow: 48,
    cancellationPenaltyPercent: 20
  }
];

// Demo Services (per office)
const DEMO_SERVICES = [
  // Muscat Business Services Center
  [
    {
      serviceName: 'Commercial Registration',
      serviceNameAr: 'السجل التجاري',
      category: 'Business Registration',
      description: 'Complete commercial registration service including name reservation, documentation, and MOCI submission',
      descriptionAr: 'خدمة تسجيل تجاري كاملة تشمل حجز الاسم والوثائق وتقديم الطلب لوزارة التجارة',
      price: '150.000',
      pricingType: 'fixed' as const,
      deliveryTimeDays: 7,
      isActive: true
    },
    {
      serviceName: 'VAT Registration',
      serviceNameAr: 'تسجيل ضريبة القيمة المضافة',
      category: 'Tax Services',
      description: 'VAT registration with Tax Authority including all required documentation',
      descriptionAr: 'تسجيل ضريبة القيمة المضافة لدى جهاز الضرائب بما في ذلك جميع الوثائق المطلوبة',
      price: '80.000',
      pricingType: 'fixed' as const,
      deliveryTimeDays: 5,
      isActive: true
    },
    {
      serviceName: 'Business License Renewal',
      serviceNameAr: 'تجديد الرخصة التجارية',
      category: 'Licensing',
      description: 'Annual business license renewal service with municipality and MOCI',
      descriptionAr: 'خدمة تجديد الرخصة التجارية السنوية مع البلدية ووزارة التجارة',
      price: '60.000',
      pricingType: 'fixed' as const,
      deliveryTimeDays: 3,
      isActive: true
    },
    {
      serviceName: 'Legal Consultation',
      serviceNameAr: 'استشارة قانونية',
      category: 'Legal Services',
      description: 'One-hour legal consultation for business matters',
      descriptionAr: 'استشارة قانونية لمدة ساعة واحدة للمسائل التجارية',
      price: '50.000',
      pricingType: 'hourly' as const,
      deliveryTimeDays: 1,
      isActive: true
    }
  ],
  // Salalah Legal & Tax Consultancy
  [
    {
      serviceName: 'Tax Compliance Review',
      serviceNameAr: 'مراجعة الامتثال الضريبي',
      category: 'Tax Services',
      description: 'Comprehensive review of your tax compliance status',
      descriptionAr: 'مراجعة شاملة لحالة الامتثال الضريبي الخاصة بك',
      price: '120.000',
      pricingType: 'fixed' as const,
      deliveryTimeDays: 5,
      isActive: true
    },
    {
      serviceName: 'Contract Drafting',
      serviceNameAr: 'صياغة العقود',
      category: 'Legal Services',
      description: 'Professional contract drafting for business agreements',
      descriptionAr: 'صياغة عقود احترافية للاتفاقيات التجارية',
      price: '100.000',
      pricingType: 'fixed' as const,
      deliveryTimeDays: 3,
      isActive: true
    },
    {
      serviceName: 'VAT Return Filing',
      serviceNameAr: 'تقديم إقرار ضريبة القيمة المضافة',
      category: 'Tax Services',
      description: 'Quarterly VAT return preparation and filing',
      descriptionAr: 'إعداد وتقديم الإقرار الضريبي ربع السنوي',
      price: '75.000',
      pricingType: 'fixed' as const,
      deliveryTimeDays: 2,
      isActive: true
    }
  ],
  // Sohar Business Hub
  [
    {
      serviceName: 'Company Formation Package',
      serviceNameAr: 'باقة تأسيس الشركة',
      category: 'Business Registration',
      description: 'Complete company formation including CR, tax card, and municipality license',
      descriptionAr: 'تأسيس شركة كامل يشمل السجل التجاري والبطاقة الضريبية ورخصة البلدية',
      price: '250.000',
      pricingType: 'fixed' as const,
      deliveryTimeDays: 10,
      isActive: true
    },
    {
      serviceName: 'Trade License',
      serviceNameAr: 'رخصة تجارية',
      category: 'Licensing',
      description: 'New trade license application and processing',
      descriptionAr: 'طلب ومعالجة رخصة تجارية جديدة',
      price: '90.000',
      pricingType: 'fixed' as const,
      deliveryTimeDays: 7,
      isActive: true
    }
  ],
  // Nizwa Heritage Business Services
  [
    {
      serviceName: 'Business Plan Development',
      serviceNameAr: 'تطوير خطة العمل',
      category: 'Consulting',
      description: 'Professional business plan for financing and growth',
      descriptionAr: 'خطة عمل احترافية للتمويل والنمو',
      price: '200.000',
      pricingType: 'fixed' as const,
      deliveryTimeDays: 14,
      isActive: true
    },
    {
      serviceName: 'Accounting Setup',
      serviceNameAr: 'إعداد المحاسبة',
      category: 'Accounting',
      description: 'Initial accounting system setup and training',
      descriptionAr: 'إعداد نظام المحاسبة الأولي والتدريب',
      price: '150.000',
      pricingType: 'fixed' as const,
      deliveryTimeDays: 5,
      isActive: true
    }
  ],
  // Sur Coastal Business Center
  [
    {
      serviceName: 'Fishing License',
      serviceNameAr: 'رخصة صيد',
      category: 'Licensing',
      description: 'Commercial fishing license application',
      descriptionAr: 'طلب رخصة صيد تجاري',
      price: '120.000',
      pricingType: 'fixed' as const,
      deliveryTimeDays: 10,
      isActive: true
    },
    {
      serviceName: 'Import/Export Documentation',
      serviceNameAr: 'وثائق الاستيراد والتصدير',
      category: 'Documentation',
      description: 'Complete import/export documentation service',
      descriptionAr: 'خدمة وثائق الاستيراد والتصدير الكاملة',
      price: '85.000',
      pricingType: 'fixed' as const,
      deliveryTimeDays: 3,
      isActive: true
    }
  ]
];

async function seedDemoData() {
  console.log('🌱 Starting demo data seeding...\n');

  const db = await getDb();
  if (!db) {
    throw new Error('Failed to connect to database');
  }

  try {
    // 1. Create demo users
    console.log('👥 Creating demo users...');
    const createdUsers = [];
    for (const userData of DEMO_USERS) {
      await db.insert(users).values({
        ...userData,
        createdAt: new Date()
      });
      // Query to get the created user
      const [user] = await db.select().from(users).where(eq(users.openId, userData.openId)).limit(1);
      if (user) {
        createdUsers.push(user);
        console.log(`   ✓ Created user: ${user.name} (${user.role})`);
      }
    }

    // 2. Create demo offices
    console.log('\n🏢 Creating demo Sanad offices...');
    const createdOffices = [];
    for (let i = 0; i < DEMO_OFFICES.length; i++) {
      const officeData = DEMO_OFFICES[i];
      const ownerId = createdUsers[i + 2].id; // Office owners start from index 2

      await db.insert(sanadOffices).values({
        ...officeData,
        ownerId,
        createdAt: new Date()
      });
      // Query to get the created office
      const offices = await db.select().from(sanadOffices).where(eq(sanadOffices.ownerId, ownerId)).limit(1);
      const office = offices[0];
      createdOffices.push(office);
      console.log(`   ✓ Created office: ${office.officeName}`);

      // 3. Create services for each office
      console.log(`   📋 Adding services for ${office.officeName}...`);
      const services = DEMO_SERVICES[i];
      for (const serviceData of services) {
        await db.insert(sanadOfficeServices).values({
          ...serviceData,
          officeId: office.id,
          createdAt: new Date()
        });
        console.log(`      ✓ Added service: ${serviceData.serviceName}`);
      }

      // 4. Create availability schedule (Mon-Fri, 9 AM - 5 PM)
      console.log(`   📅 Setting up availability for ${office.officeName}...`);
      const workDays = [1, 2, 3, 4, 5]; // Monday to Friday
      for (const dayOfWeek of workDays) {
        await db.insert(officeAvailability).values({
          officeId: office.id,
          dayOfWeek,
          startTime: '09:00',
          endTime: '17:00',
          isActive: true,
          createdAt: new Date()
        });
      }
      console.log(`      ✓ Added Mon-Fri availability (9 AM - 5 PM)`);
    }

    // 5. Create sample bookings
    console.log('\n📅 Creating sample bookings...');
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    // Get services for booking creation
    const allServices = await db.select().from(sanadOfficeServices).limit(10);
    
    const bookingStatuses = ['confirmed', 'completed', 'pending'] as const;
    let bookingCount = 0;

    for (let i = 0; i < 15; i++) {
      const customer = createdUsers[i % 2]; // Alternate between SME owners
      const service = allServices[i % allServices.length];
      const office = createdOffices.find(o => o.id === service.officeId);
      
      if (!office) continue;

      const daysOffset = Math.floor(Math.random() * 30) - 15; // -15 to +15 days
      const scheduledTime = now + (daysOffset * oneDayMs);
      const status = daysOffset < 0 ? 'completed' : (daysOffset < 7 ? 'confirmed' : 'pending');

      await db.insert(bookings).values({
        customerId: customer.id,
        officeId: office.id,
        serviceId: service.id,
        scheduledTime,
        duration: 60,
        status,
        totalPrice: service.price,
        notes: `Demo booking for ${service.serviceName}`,
        createdAt: now - (Math.abs(daysOffset) * oneDayMs)
      });
      bookingCount++;
    }
    console.log(`   ✓ Created ${bookingCount} sample bookings`);

    // 6. Create service requests
    console.log('\n📢 Creating service requests...');
    const requestCategories = ['Business Registration', 'Tax Services', 'Legal Services', 'Accounting'];
    const urgencyLevels = ['medium', 'high', 'low'] as const;

    for (let i = 0; i < 8; i++) {
      const customer = createdUsers[i % 2];
      const category = requestCategories[i % requestCategories.length];
      
      await db.insert(serviceRequests).values({
        customerId: customer.id,
        title: `Need ${category} assistance`,
        titleAr: `بحاجة إلى مساعدة في ${category}`,
        description: `Looking for professional ${category} services. Please provide detailed quote.`,
        descriptionAr: `أبحث عن خدمات ${category} احترافية. يرجى تقديم عرض سعر مفصل.`,
        category,
        budgetMin: '50.000',
        budgetMax: '200.000',
        urgency: urgencyLevels[i % 3],
        governorate: DEMO_OFFICES[i % DEMO_OFFICES.length].governorate,
        status: i < 4 ? 'open' : 'closed',
        createdAt: now - (i * oneDayMs)
      });
      // Query to get the created request
      const requests = await db.select().from(serviceRequests).where(eq(serviceRequests.customerId, customer.id)).limit(1);
      const request = requests[0];

      // Create 2-3 bids for each request
      const numBids = 2 + Math.floor(Math.random() * 2);
      for (let j = 0; j < numBids && j < createdOffices.length; j++) {
        const office = createdOffices[j];
        await db.insert(serviceBids).values({
          requestId: request.id,
          officeId: office.id,
          proposedPrice: String(50 + (j * 25) + Math.random() * 50),
          estimatedDeliveryDays: 3 + j * 2,
          coverLetter: `We at ${office.officeName} are pleased to offer our services for your ${category} needs.`,
          coverLetterAr: `يسعدنا في ${office.officeNameAr} تقديم خدماتنا لاحتياجاتك في ${category}.`,
          status: j === 0 && i < 2 ? 'accepted' : 'pending',
          createdAt: now - (i * oneDayMs) + (j * 60 * 60 * 1000)
        });
      }
    }
    console.log(`   ✓ Created 8 service requests with multiple bids`);

    // 7. Create reviews
    console.log('\n⭐ Creating reviews...');
    const reviewTexts = [
      { text: 'Excellent service! Very professional and fast.', textAr: 'خدمة ممتازة! محترفون جداً وسريعون.' },
      { text: 'Great experience, highly recommend!', textAr: 'تجربة رائعة، أوصي بشدة!' },
      { text: 'Good service, reasonable prices.', textAr: 'خدمة جيدة، أسعار معقولة.' },
      { text: 'Professional team, delivered on time.', textAr: 'فريق محترف، تسليم في الوقت المحدد.' },
      { text: 'Very helpful staff, smooth process.', textAr: 'موظفون متعاونون جداً، عملية سلسة.' }
    ];

    for (let i = 0; i < createdOffices.length; i++) {
      const office = createdOffices[i];
      const numReviews = 3 + Math.floor(Math.random() * 3);
      
      for (let j = 0; j < numReviews; j++) {
        const reviewer = createdUsers[j % 2];
        const review = reviewTexts[j % reviewTexts.length];
        
        await db.insert(reviews).values({
          officeId: office.id,
          userId: reviewer.id,
          rating: 4 + Math.floor(Math.random() * 2), // 4 or 5 stars
          comment: review.text,
          commentAr: review.textAr,
          createdAt: now - (j * 7 * oneDayMs)
        });
      }
      console.log(`   ✓ Added ${numReviews} reviews for ${office.officeName}`);
    }

    // 8. Create loyalty transactions
    console.log('\n🎁 Creating loyalty point transactions...');
    for (const user of createdUsers.slice(0, 2)) {
      // Award points for bookings
      await db.insert(loyaltyTransactions).values({
        userId: user.id,
        points: 50,
        type: 'earned',
        description: 'Points earned from completed bookings',
        descriptionAr: 'نقاط مكتسبة من الحجوزات المكتملة',
        createdAt: now - (5 * oneDayMs)
      });

      // Award points for reviews
      await db.insert(loyaltyTransactions).values({
        userId: user.id,
        points: 25,
        type: 'earned',
        description: 'Points earned from writing reviews',
        descriptionAr: 'نقاط مكتسبة من كتابة التقييمات',
        createdAt: now - (3 * oneDayMs)
      });
    }
    console.log(`   ✓ Created loyalty transactions for demo users`);

    // 9. Create sample notifications
    console.log('\n🔔 Creating sample notifications...');
    for (const user of createdUsers.slice(0, 2)) {
      await db.insert(notifications).values({
        userId: user.id,
        type: 'booking_confirmed',
        title: 'Booking Confirmed',
        titleAr: 'تم تأكيد الحجز',
        message: 'Your booking has been confirmed',
        messageAr: 'تم تأكيد حجزك',
        isRead: false,
        createdAt: now - (2 * oneDayMs)
      });
    }
    console.log(`   ✓ Created sample notifications`);

    console.log('\n✅ Demo data seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - ${createdUsers.length} demo users created`);
    console.log(`   - ${createdOffices.length} Sanad offices created`);
    console.log(`   - ${allServices.length} services added`);
    console.log(`   - ${bookingCount} bookings created`);
    console.log(`   - 8 service requests with bids`);
    console.log(`   - Multiple reviews and loyalty transactions`);
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
