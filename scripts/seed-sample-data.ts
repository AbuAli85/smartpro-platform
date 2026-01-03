import { drizzle } from "drizzle-orm/mysql2";
import { sanadOffices, officeAvailability, bookings, sanadOfficeServices } from "../drizzle/schema";

async function seedSampleData() {
  console.log("🌱 Starting sample data seeding...\n");

  const db = drizzle(process.env.DATABASE_URL!);

  // Sample Offices
  const sampleOffices = [
    {
      officeName: "Muscat Business Hub",
      officeNameAr: "مركز مسقط للأعمال",
      slug: "muscat-business-hub",
      description: "Premier business services center in the heart of Muscat, offering comprehensive company registration, licensing, and documentation services.",
      descriptionAr: "مركز خدمات الأعمال الرائد في قلب مسقط",
      commercialRegistration: "CR-2024-MSQ-001",
      tradeLicense: "LIC-2024-001",
      taxRegistration: "TAX-2024-001",
      governorate: "Muscat",
      wilayat: "Muscat",
      addressLine1: "Al Khuwair, Building 42, Office 301",
      phone: "+968 2460 1234",
      email: "info@muscatbusinesshub.om",
      website: "https://muscatbusinesshub.om",
      status: "active",
      ownerId: 1,
      acceptsOnlineBookings: true,
      autoAcceptBookings: false,
      workingHours: "Sunday-Thursday: 9:00 AM - 5:00 PM",
    },
    {
      officeName: "Salalah Trade Center",
      officeNameAr: "مركز صلالة التجاري",
      slug: "salalah-trade-center",
      description: "Leading business facilitation center in Salalah, specializing in import/export documentation and trade licenses.",
      descriptionAr: "مركز تسهيل الأعمال الرائد في صلالة",
      commercialRegistration: "CR-2024-SLL-002",
      tradeLicense: "LIC-2024-002",
      taxRegistration: "TAX-2024-002",
      governorate: "Dhofar",
      wilayat: "Salalah",
      addressLine1: "Al Dahariz, Commercial Complex, Floor 2",
      phone: "+968 2329 5678",
      email: "contact@salalahtradecentre.om",
      website: "https://salalahtradecentre.om",
      status: "active",
      ownerId: 1,
      acceptsOnlineBookings: true,
      autoAcceptBookings: true,
      workingHours: "Sunday-Thursday: 8:00 AM - 4:00 PM",
    },
    {
      officeName: "Sohar Industrial Services",
      officeNameAr: "خدمات صحار الصناعية",
      slug: "sohar-industrial-services",
      description: "Specialized in industrial licensing, factory registration, and environmental permits for the Sohar Industrial Port area.",
      descriptionAr: "متخصص في الترخيص الصناعي",
      commercialRegistration: "CR-2024-SHR-003",
      tradeLicense: "LIC-2024-003",
      taxRegistration: "TAX-2024-003",
      governorate: "North Al Batinah",
      wilayat: "Sohar",
      addressLine1: "Sohar Industrial Estate, Gate 3",
      phone: "+968 2684 3210",
      email: "services@soharindustrial.om",
      status: "active",
      ownerId: 1,
      acceptsOnlineBookings: true,
      autoAcceptBookings: false,
      workingHours: "Sunday-Thursday: 9:00 AM - 5:00 PM",
    },
    {
      officeName: "Nizwa Heritage Business Center",
      officeNameAr: "مركز نزوى التراثي للأعمال",
      slug: "nizwa-heritage-business",
      description: "Supporting SMEs in the interior region with business registration, tourism licenses, and handicraft certifications.",
      descriptionAr: "دعم الشركات الصغيرة والمتوسطة",
      commercialRegistration: "CR-2024-NZW-004",
      tradeLicense: "LIC-2024-004",
      taxRegistration: "TAX-2024-004",
      governorate: "Ad Dakhiliyah",
      wilayat: "Nizwa",
      addressLine1: "Nizwa Souq Area, Heritage Building",
      phone: "+968 2541 8765",
      email: "info@nizwabusiness.om",
      status: "pending",
      ownerId: 1,
      acceptsOnlineBookings: false,
      autoAcceptBookings: false,
      workingHours: "Sunday-Thursday: 9:00 AM - 4:00 PM",
    },
  ];

  console.log("📍 Seeding offices...");
  const officeIds: number[] = [];
  
  for (const office of sampleOffices) {
    const result = await db.insert(sanadOffices).values(office as any);
    const insertId = Number(result[0].insertId);
    officeIds.push(insertId);
    console.log(`  ✓ Created: ${office.officeName}`);
  }

  // Sample Services for each office
  console.log("\n🛠️  Seeding services...");
  const services = [
    { name: "Company Registration", nameAr: "تسجيل الشركة", category: "registration", price: "150.000", duration: 120 },
    { name: "Business License Renewal", nameAr: "تجديد الرخصة التجارية", category: "licensing", price: "75.000", duration: 60 },
    { name: "Document Attestation", nameAr: "تصديق المستندات", category: "documentation", price: "25.000", duration: 30 },
    { name: "Tax Registration", nameAr: "التسجيل الضريبي", category: "tax", price: "50.000", duration: 90 },
  ];

  for (const officeId of officeIds.slice(0, 3)) { // Only for active offices
    for (const service of services) {
      await db.insert(sanadOfficeServices).values({
        officeId,
        serviceName: service.name,
        serviceNameAr: service.nameAr,
        category: service.category,
        description: `Professional ${service.name.toLowerCase()} service`,
        price: service.price,
        currency: "OMR",
        isActive: true,
      } as any);
    }
    console.log(`  ✓ Added services for office ${officeId}`);
  }

  // Office Availability (Working Hours)
  console.log("\n⏰ Seeding office availability...");
  const workingDays = [0, 1, 2, 3, 4]; // Sunday to Thursday
  
  for (const officeId of officeIds.slice(0, 3)) {
    for (const dayOfWeek of workingDays) {
      await db.insert(officeAvailability).values({
        officeId,
        dayOfWeek,
        startTime: "09:00",
        endTime: "17:00",
        slotDuration: 60,
        isActive: true,
      } as any);
    }
    console.log(`  ✓ Set availability for office ${officeId}`);
  }

  // Sample Bookings (requires a user - using owner as default)
  console.log("\n📅 Seeding sample bookings...");
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const sampleBookings = [
    {
      officeId: officeIds[0],
      userId: 1, // Owner user
      serviceDescription: "Need to register a new LLC company for import/export business",
      requirements: "Commercial registration documents, passport copies, business plan",
      scheduledDate: tomorrow,
      scheduledTime: "10:00",
      duration: 120,
      status: "confirmed",
    },
    {
      officeId: officeIds[1],
      userId: 1,
      serviceDescription: "Business license renewal for existing trading company",
      requirements: "Current license, tax clearance certificate",
      scheduledDate: tomorrow,
      scheduledTime: "14:00",
      duration: 60,
      status: "pending",
    },
    {
      officeId: officeIds[0],
      userId: 1,
      serviceDescription: "Document attestation for employment contracts",
      requirements: "Original contracts, company stamp",
      scheduledDate: nextWeek,
      scheduledTime: "11:00",
      duration: 30,
      status: "confirmed",
    },
  ];

  for (const booking of sampleBookings) {
    await db.insert(bookings).values(booking as any);
    console.log(`  ✓ Created booking at office ${booking.officeId}`);
  }

  console.log("\n✅ Sample data seeding completed!");
  console.log(`\n📊 Summary:`);
  console.log(`   • ${sampleOffices.length} offices created (3 active, 1 pending)`);
  console.log(`   • ${services.length * 3} services added`);
  console.log(`   • ${workingDays.length * 3} availability slots configured`);
  console.log(`   • ${sampleBookings.length} sample bookings created`);
  console.log(`\n🎉 Platform is now ready for testing!\n`);
  
  process.exit(0);
}

seedSampleData().catch((error) => {
  console.error("❌ Error seeding sample data:", error);
  process.exit(1);
});
