/**
 * Enhanced Demo Data Seeding Script
 * Adds services, bookings, service requests, reviews, and more
 * 
 * Run AFTER seed-demo-simple.ts
 * Run with: npx tsx scripts/seed-enhanced-data.ts
 */

import { getDb } from '../server/db';
import { eq, desc } from 'drizzle-orm';
import { 
  users, 
  sanadOffices, 
  sanadOfficeServices, 
  officeAvailability,
  bookings,
  serviceRequests,
  serviceBids,
  reviews,
  loyaltyTransactions,
  notifications
} from '../drizzle/schema';

async function seedEnhancedData() {
  console.log('🌱 Starting enhanced demo data seeding...\n');

  const db = await getDb();
  if (!db) {
    throw new Error('Failed to connect to database');
  }

  try {
    // Get existing users and offices
    const smeUsers = await db.select().from(users).where(eq(users.role, 'user')).limit(2);
    const offices = await db.select().from(sanadOffices).limit(10);

    if (smeUsers.length === 0 || offices.length === 0) {
      console.error('❌ Please run seed-demo-simple.ts first to create users and offices');
      return;
    }

    console.log(`Found ${smeUsers.length} SME users and ${offices.length} offices\n`);

    // 1. Create services for each office
    console.log('📋 Creating services for offices...');
    
    const servicesByOffice = [
      // Muscat Business Services
      [
        {
          serviceName: 'Commercial Registration',
          serviceNameAr: 'السجل التجاري',
          category: 'Business Registration',
          description: 'Complete commercial registration service',
          descriptionAr: 'خدمة تسجيل تجاري كاملة',
          basePrice: '150.000',
          pricingType: 'fixed' as const,
          estimatedDeliveryDays: 7,
          isActive: true
        },
        {
          serviceName: 'VAT Registration',
          serviceNameAr: 'تسجيل ضريبة القيمة المضافة',
          category: 'Tax Services',
          description: 'VAT registration with Tax Authority',
          descriptionAr: 'تسجيل ضريبة القيمة المضافة',
          basePrice: '80.000',
          pricingType: 'fixed' as const,
          estimatedDeliveryDays: 5,
          isActive: true
        },
        {
          serviceName: 'Business License Renewal',
          serviceNameAr: 'تجديد الرخصة التجارية',
          category: 'Licensing',
          description: 'Annual business license renewal',
          descriptionAr: 'تجديد الرخصة التجارية السنوية',
          basePrice: '60.000',
          pricingType: 'fixed' as const,
          estimatedDeliveryDays: 3,
          isActive: true
        }
      ],
      // Salalah Legal Consultancy
      [
        {
          serviceName: 'Tax Compliance Review',
          serviceNameAr: 'مراجعة الامتثال الضريبي',
          category: 'Tax Services',
          description: 'Comprehensive tax compliance review',
          descriptionAr: 'مراجعة شاملة للامتثال الضريبي',
          basePrice: '120.000',
          pricingType: 'fixed' as const,
          estimatedDeliveryDays: 5,
          isActive: true
        },
        {
          serviceName: 'Contract Drafting',
          serviceNameAr: 'صياغة العقود',
          category: 'Legal Services',
          description: 'Professional contract drafting',
          descriptionAr: 'صياغة عقود احترافية',
          basePrice: '100.000',
          pricingType: 'fixed' as const,
          estimatedDeliveryDays: 3,
          isActive: true
        }
      ],
      // Sohar Business Hub
      [
        {
          serviceName: 'Company Formation Package',
          serviceNameAr: 'باقة تأسيس الشركة',
          category: 'Business Registration',
          description: 'Complete company formation package',
          descriptionAr: 'باقة تأسيس شركة كاملة',
          basePrice: '250.000',
          pricingType: 'fixed' as const,
          estimatedDeliveryDays: 10,
          isActive: true
        },
        {
          serviceName: 'Trade License',
          serviceNameAr: 'رخصة تجارية',
          category: 'Licensing',
          description: 'New trade license application',
          descriptionAr: 'طلب رخصة تجارية جديدة',
          basePrice: '90.000',
          pricingType: 'fixed' as const,
          estimatedDeliveryDays: 7,
          isActive: true
        }
      ]
    ];

    const createdServices = [];
    for (let i = 0; i < Math.min(offices.length, servicesByOffice.length); i++) {
      const office = offices[i];
      const services = servicesByOffice[i];
      
      for (const serviceData of services) {
        await db.insert(sanadOfficeServices).values({
          ...serviceData,
          officeId: office.id,
          createdAt: new Date()
        });
        createdServices.push({ ...serviceData, officeId: office.id });
      }
      console.log(`   ✓ Added ${services.length} services for ${office.officeName}`);
    }

    // 2. Create availability schedules
    console.log('\n📅 Creating availability schedules...');
    for (const office of offices) {
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
    }
    console.log(`   ✓ Added Mon-Fri (9 AM - 5 PM) availability for all offices`);

    // 3. Create bookings
    console.log('\n📅 Creating sample bookings...');
    const allServices = await db.select().from(sanadOfficeServices).limit(10);
    const now = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;

    let bookingCount = 0;
    for (let i = 0; i < 10; i++) {
      const customer = smeUsers[i % smeUsers.length];
      const service = allServices[i % allServices.length];
      const office = offices.find(o => o.id === service.officeId);
      
      if (!office) continue;

      const daysOffset = Math.floor(Math.random() * 20) - 10; // -10 to +10 days
      const scheduledTime = new Date(now.getTime() + (daysOffset * oneDayMs));
      const status = daysOffset < 0 ? 'completed' : (daysOffset < 5 ? 'confirmed' : 'pending');

      await db.insert(bookings).values({
        customerId: customer.id,
        officeId: office.id,
        serviceId: service.id,
        scheduledTime,
        duration: 60,
        status,
        totalPrice: service.basePrice,
        notes: `Demo booking for ${service.serviceName}`,
        createdAt: new Date(now.getTime() - Math.abs(daysOffset) * oneDayMs)
      });
      bookingCount++;
    }
    console.log(`   ✓ Created ${bookingCount} sample bookings`);

    // 4. Create service requests with bids
    console.log('\n📢 Creating service requests with bids...');
    const categories = ['Business Registration', 'Tax Services', 'Legal Services', 'Accounting'];
    const urgencyLevels = ['medium', 'high', 'low'] as const;

    for (let i = 0; i < 5; i++) {
      const customer = smeUsers[i % smeUsers.length];
      const category = categories[i % categories.length];
      
      await db.insert(serviceRequests).values({
        userId: customer.id,
        title: `Need ${category} assistance`,
        titleAr: `بحاجة إلى مساعدة في ${category}`,
        description: `Looking for professional ${category} services. Please provide detailed quote.`,
        descriptionAr: `أبحث عن خدمات ${category} احترافية.`,
        serviceType: category,
        category,
        budgetMin: '50.000',
        budgetMax: '200.000',
        urgency: urgencyLevels[i % 3],
        governorate: offices[i % offices.length].governorate,
        status: i < 3 ? 'open' : 'completed',
        createdAt: new Date(now.getTime() - i * oneDayMs)
      });

      // Get the created request
      const requests = await db.select().from(serviceRequests)
        .where(eq(serviceRequests.userId, customer.id))
        .orderBy(desc(serviceRequests.createdAt))
        .limit(1);
      
      if (requests[0]) {
        // Create 2 bids for each request
        for (let j = 0; j < 2 && j < offices.length; j++) {
          const office = offices[j];
          await db.insert(serviceBids).values({
            requestId: requests[0].id,
            officeId: office.id,
            proposedPrice: String(50 + (j * 25) + Math.random() * 50),
            estimatedDeliveryDays: 3 + j * 2,
            coverLetter: `We at ${office.officeName} are pleased to offer our services.`,
            coverLetterAr: `يسعدنا في ${office.officeNameAr} تقديم خدماتنا.`,
            status: j === 0 && i < 2 ? 'accepted' : 'pending',
            createdAt: new Date(now.getTime() - i * oneDayMs + j * 60 * 60 * 1000)
          });
        }
      }
    }
    console.log(`   ✓ Created 5 service requests with multiple bids`);

    // 5. Create reviews
    console.log('\n⭐ Creating reviews...');
    const reviewTexts = [
      { text: 'Excellent service! Very professional and fast.', textAr: 'خدمة ممتازة! محترفون جداً وسريعون.' },
      { text: 'Great experience, highly recommend!', textAr: 'تجربة رائعة، أوصي بشدة!' },
      { text: 'Good service, reasonable prices.', textAr: 'خدمة جيدة، أسعار معقولة.' },
      { text: 'Professional team, delivered on time.', textAr: 'فريق محترف، تسليم في الوقت المحدد.' }
    ];

    let reviewCount = 0;
    for (let i = 0; i < offices.length; i++) {
      const office = offices[i];
      const numReviews = 2 + Math.floor(Math.random() * 2);
      
      for (let j = 0; j < numReviews; j++) {
        const reviewer = smeUsers[j % smeUsers.length];
        const review = reviewTexts[j % reviewTexts.length];
        
        await db.insert(reviews).values({
          officeId: office.id,
          userId: reviewer.id,
          rating: 4 + Math.floor(Math.random() * 2), // 4 or 5 stars
          comment: review.text,
          commentAr: review.textAr,
          createdAt: new Date(now.getTime() - j * 7 * oneDayMs)
        });
        reviewCount++;
      }
    }
    console.log(`   ✓ Created ${reviewCount} reviews`);

    // 6. Create loyalty transactions
    console.log('\n🎁 Creating loyalty transactions...');
    for (const user of smeUsers) {
      // Award points for bookings
      await db.insert(loyaltyTransactions).values({
        userId: user.id,
        points: 50,
        type: 'earn',
        reason: 'booking_completed',
        description: 'Points earned from completed bookings',
        descriptionAr: 'نقاط مكتسبة من الحجوزات المكتملة',
        createdAt: new Date(now.getTime() - 5 * oneDayMs)
      });

      // Award points for reviews
      await db.insert(loyaltyTransactions).values({
        userId: user.id,
        points: 25,
        type: 'earn',
        reason: 'review_posted',
        description: 'Points earned from writing reviews',
        descriptionAr: 'نقاط مكتسبة من كتابة التقييمات',
        createdAt: new Date(now.getTime() - 3 * oneDayMs)
      });
    }
    console.log(`   ✓ Created loyalty transactions for ${smeUsers.length} users`);

    // 7. Create notifications
    console.log('\n🔔 Creating notifications...');
    for (const user of smeUsers) {
      await db.insert(notifications).values({
        userId: user.id,
        type: 'booking',
        title: 'Booking Confirmed',
        titleAr: 'تم تأكيد الحجز',
        message: 'Your booking has been confirmed',
        messageAr: 'تم تأكيد حجزك',
        isRead: false,
        createdAt: new Date(now.getTime() - 2 * oneDayMs)
      });
    }
    console.log(`   ✓ Created notifications for ${smeUsers.length} users`);

    console.log('\n✅ Enhanced demo data seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - ${createdServices.length} services added`);
    console.log(`   - ${bookingCount} bookings created`);
    console.log(`   - 5 service requests with bids`);
    console.log(`   - ${reviewCount} reviews created`);
    console.log(`   - Loyalty transactions and notifications added`);
    console.log('\n🎉 Platform is fully populated with demo data!\n');

  } catch (error) {
    console.error('❌ Error seeding enhanced data:', error);
    throw error;
  }
}

// Run the seeding script
seedEnhancedData()
  .then(() => {
    console.log('Enhanced seeding script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Enhanced seeding script failed:', error);
    process.exit(1);
  });
