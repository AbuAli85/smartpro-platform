/**
 * Calendar Invite Generator
 * Generates .ics calendar files for booking confirmations
 */

interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
  organizerEmail: string;
  organizerName: string;
  attendeeEmail: string;
  attendeeName: string;
}

/**
 * Format date to iCalendar format (YYYYMMDDTHHMMSSZ)
 */
function formatICalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Generate a unique UID for the calendar event
 */
function generateUID(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}@smartpro.om`;
}

/**
 * Escape special characters for iCalendar format
 */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generate .ics calendar file content
 */
export function generateCalendarInvite(event: CalendarEvent): string {
  const uid = generateUID();
  const now = formatICalDate(new Date());
  const startTime = formatICalDate(event.startTime);
  const endTime = formatICalDate(event.endTime);

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SmartPro//Booking System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${startTime}`,
    `DTEND:${endTime}`,
    `SUMMARY:${escapeICalText(event.title)}`,
    `DESCRIPTION:${escapeICalText(event.description)}`,
    `LOCATION:${escapeICalText(event.location)}`,
    `ORGANIZER;CN=${escapeICalText(event.organizerName)}:mailto:${event.organizerEmail}`,
    `ATTENDEE;CN=${escapeICalText(event.attendeeName)};RSVP=TRUE:mailto:${event.attendeeEmail}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Appointment tomorrow',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
}

/**
 * Generate calendar invite for a booking
 */
export function generateBookingCalendarInvite(params: {
  bookingId: number;
  serviceName: string;
  officeName: string;
  officeAddress: string;
  officePhone: string;
  appointmentDate: Date;
  durationMinutes: number;
  userName: string;
  userEmail: string;
  officeEmail: string;
}): string {
  const endTime = new Date(params.appointmentDate);
  endTime.setMinutes(endTime.getMinutes() + params.durationMinutes);

  const description = [
    `Booking ID: ${params.bookingId}`,
    `Service: ${params.serviceName}`,
    `Office: ${params.officeName}`,
    `Phone: ${params.officePhone}`,
    '',
    'Please arrive 10 minutes before your scheduled time.',
    'If you need to cancel or reschedule, please contact the office at least 24 hours in advance.'
  ].join('\\n');

  return generateCalendarInvite({
    title: `${params.serviceName} - ${params.officeName}`,
    description,
    location: params.officeAddress,
    startTime: params.appointmentDate,
    endTime,
    organizerEmail: params.officeEmail,
    organizerName: params.officeName,
    attendeeEmail: params.userEmail,
    attendeeName: params.userName,
  });
}
