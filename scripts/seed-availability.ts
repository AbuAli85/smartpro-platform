import { drizzle } from "drizzle-orm/mysql2";
import { officeAvailability, sanadOffices } from "../drizzle/schema";

async function seedAvailability() {
  console.log("Starting office availability seeding...");

  const db = drizzle(process.env.DATABASE_URL!);

  // Get all offices
  const offices = await db.select().from(sanadOffices);

  if (offices.length === 0) {
    console.log("No offices found. Please seed offices first.");
    return;
  }

  // Standard working hours: Sunday-Thursday, 9:00-17:00
  const workingDays = [0, 1, 2, 3, 4]; // Sunday to Thursday
  const startTime = "09:00";
  const endTime = "17:00";
  const slotDuration = 60; // 1 hour slots

  for (const office of offices) {
    console.log(`Setting availability for: ${office.officeName}`);

    for (const dayOfWeek of workingDays) {
      await db.insert(officeAvailability).values({
        officeId: office.id,
        dayOfWeek,
        startTime,
        endTime,
        slotDuration,
        isActive: true,
      });
    }

    console.log(`✓ Set availability for ${office.officeName}`);
  }

  console.log("✅ Office availability seeding completed!");
  console.log(`🎉 Set working hours for ${offices.length} offices!`);
  process.exit(0);
}

seedAvailability().catch((error) => {
  console.error("❌ Error seeding availability:", error);
  process.exit(1);
});
