import { getAvailableTimeSlots } from './server/db.ts';

// Test office ID from the slug 'test-office-filters-1766758228421'
// December 29, 2025 is a Monday (dayOfWeek = 1)
const testDate = new Date('2025-12-29');
console.log('Testing date:', testDate.toDateString());
console.log('Day of week:', testDate.getDay(), '(0=Sunday, 1=Monday)');

// Get office ID first
import { db } from './server/_core/db.js';
const officeResult = await db.execute('SELECT id FROM sanad_offices WHERE slug = ?', ['test-office-filters-1766758228421']);
const officeId = officeResult.rows[0]?.id;

console.log('Office ID:', officeId);

if (officeId) {
  const slots = await getAvailableTimeSlots(officeId, testDate);
  console.log('Available slots:', slots);
  console.log('Total slots:', slots.length);
} else {
  console.log('Office not found!');
}
