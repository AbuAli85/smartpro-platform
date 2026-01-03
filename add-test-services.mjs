import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./drizzle/schema.js";
import { eq } from "drizzle-orm";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: "default" });

async function addTestServices() {
  console.log("Adding test services to offices...");

  // Get all test offices
  const offices = await db
    .select()
    .from(schema.sanadOffices)
    .where(eq(schema.sanadOffices.officeName, "Test Office for Filters"));

  if (offices.length === 0) {
    console.log("No test offices found");
    return;
  }

  console.log(`Found ${offices.length} test offices`);

  // Sample services to add
  const services = [
    {
      serviceName: "Company Registration",
      serviceNameAr: "تسجيل شركة",
      description: "Complete company registration with all required documents",
      descriptionAr: "تسجيل شركة كامل مع جميع المستندات المطلوبة",
      category: "business",
      price: 500,
      estimatedDeliveryDays: 7,
    },
    {
      serviceName: "Legal Consultation",
      serviceNameAr: "استشارة قانونية",
      description: "One-hour legal consultation for business matters",
      descriptionAr: "استشارة قانونية لمدة ساعة واحدة للأمور التجارية",
      category: "legal",
      price: 100,
      estimatedDeliveryDays: 1,
    },
    {
      serviceName: "Contract Drafting",
      serviceNameAr: "صياغة عقد",
      description: "Professional contract drafting and review",
      descriptionAr: "صياغة ومراجعة عقود احترافية",
      category: "legal",
      price: 200,
      estimatedDeliveryDays: 3,
    },
    {
      serviceName: "Tax Registration",
      serviceNameAr: "التسجيل الضريبي",
      description: "VAT and tax registration services",
      descriptionAr: "خدمات التسجيل في ضريبة القيمة المضافة والضرائب",
      category: "business",
      price: 150,
      estimatedDeliveryDays: 5,
    },
  ];

  let totalAdded = 0;

  for (const office of offices) {
    console.log(`\nAdding services to office: ${office.officeName} (ID: ${office.id})`);

    for (const service of services) {
      try {
        await db.insert(schema.officeServices).values({
          officeId: office.id,
          ...service,
        });
        console.log(`  ✓ Added: ${service.serviceName}`);
        totalAdded++;
      } catch (error) {
        console.error(`  ✗ Failed to add ${service.serviceName}:`, error.message);
      }
    }
  }

  console.log(`\n✅ Successfully added ${totalAdded} services to ${offices.length} offices`);
}

addTestServices()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
