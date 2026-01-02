import { drizzle } from "drizzle-orm/mysql2";
import { users, sanadOffices, bookings } from "./drizzle/schema.js";
import { sql } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);

const [usersCount, officesCount, bookingsCount] = await Promise.all([
  db.select({ count: sql`count(*)` }).from(users),
  db.select({ count: sql`count(*)` }).from(sanadOffices),
  db.select({ count: sql`count(*)` }).from(bookings),
]);

console.log("Users count:", usersCount[0]);
console.log("Offices count:", officesCount[0]);
console.log("Bookings count:", bookingsCount[0]);

process.exit(0);
