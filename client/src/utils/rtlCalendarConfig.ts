import { CalendarOptions } from "@fullcalendar/core";

/**
 * RTL Configuration for FullCalendar
 * 
 * Provides RTL-aware configuration for FullCalendar components.
 * Automatically adjusts direction, button order, and text alignment.
 * 
 * @example
 * import { getRTLCalendarConfig } from "@/utils/rtlCalendarConfig";
 * 
 * <FullCalendar
 *   {...getRTLCalendarConfig(isRTL)}
 *   plugins={[dayGridPlugin, timeGridPlugin]}
 * />
 */

export interface RTLCalendarConfig extends Partial<CalendarOptions> {
  direction?: 'ltr' | 'rtl';
  buttonText?: Record<string, string>;
  headerToolbar?: {
    left?: string;
    center?: string;
    right?: string;
  };
}

/**
 * Get RTL-aware FullCalendar configuration
 */
export function getRTLCalendarConfig(
  isRTL: boolean,
  locale?: string
): RTLCalendarConfig {
  return {
    // Set text direction
    direction: isRTL ? 'rtl' : 'ltr',
    
    // Flip header toolbar buttons for RTL
    headerToolbar: isRTL
      ? {
          // Swap left and right for RTL
          left: 'next,prev today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }
      : {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        },
    
    // Arabic button text (if locale is Arabic)
    buttonText: locale === 'ar' ? {
      today: 'اليوم',
      month: 'شهر',
      week: 'أسبوع',
      day: 'يوم',
      list: 'قائمة',
      prev: 'السابق',
      next: 'التالي',
    } : undefined,
    
    // First day of week (Sunday for Arabic, Monday for English)
    firstDay: locale === 'ar' ? 0 : 1,
    
    // Time format (12-hour for Arabic, 24-hour for English)
    slotLabelFormat: {
      hour: 'numeric',
      minute: '2-digit',
      hour12: locale === 'ar',
    },
    
    // Event time format
    eventTimeFormat: {
      hour: 'numeric',
      minute: '2-digit',
      hour12: locale === 'ar',
    },
    
    // Locale-specific settings
    locale: locale || 'en',
    
    // Height and display settings
    height: 'auto',
    contentHeight: 'auto',
    aspectRatio: 1.5,
    
    // Event display settings
    displayEventTime: true,
    displayEventEnd: true,
    
    // Interaction settings
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    
    // Navigation settings
    navLinks: true,
    editable: false,
    
    // Week numbers (show on right in RTL, left in LTR)
    weekNumbers: false,
    weekNumberCalculation: 'ISO',
  };
}

/**
 * Get RTL-aware month names for Arabic
 */
export function getArabicMonthNames(): string[] {
  return [
    'يناير',
    'فبراير',
    'مارس',
    'أبريل',
    'مايو',
    'يونيو',
    'يوليو',
    'أغسطس',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر',
  ];
}

/**
 * Get RTL-aware day names for Arabic
 */
export function getArabicDayNames(): {
  long: string[];
  short: string[];
  narrow: string[];
} {
  return {
    long: [
      'الأحد',
      'الإثنين',
      'الثلاثاء',
      'الأربعاء',
      'الخميس',
      'الجمعة',
      'السبت',
    ],
    short: [
      'أحد',
      'إثنين',
      'ثلاثاء',
      'أربعاء',
      'خميس',
      'جمعة',
      'سبت',
    ],
    narrow: [
      'ح',
      'ن',
      'ث',
      'ر',
      'خ',
      'ج',
      'س',
    ],
  };
}

/**
 * Custom CSS for RTL FullCalendar
 * Apply this to your global styles or component
 */
export const rtlCalendarCSS = `
  /* RTL-specific FullCalendar styles */
  .fc.fc-direction-rtl {
    direction: rtl;
  }
  
  .fc.fc-direction-rtl .fc-toolbar {
    direction: rtl;
  }
  
  .fc.fc-direction-rtl .fc-toolbar-chunk {
    display: flex;
    flex-direction: row-reverse;
  }
  
  .fc.fc-direction-rtl .fc-button-group {
    flex-direction: row-reverse;
  }
  
  .fc.fc-direction-rtl .fc-daygrid-day-number {
    text-align: left;
    padding-right: 0;
    padding-left: 4px;
  }
  
  .fc.fc-direction-rtl .fc-event-time {
    text-align: right;
  }
  
  .fc.fc-direction-rtl .fc-event-title {
    text-align: right;
  }
  
  .fc.fc-direction-rtl .fc-col-header-cell-cushion {
    text-align: center;
  }
  
  .fc.fc-direction-rtl .fc-timegrid-slot-label {
    text-align: left;
  }
  
  .fc.fc-direction-rtl .fc-timegrid-event {
    text-align: right;
  }
  
  /* Button icon flipping for RTL */
  .fc.fc-direction-rtl .fc-icon-chevron-left:before {
    content: "\\e901"; /* chevron-right */
  }
  
  .fc.fc-direction-rtl .fc-icon-chevron-right:before {
    content: "\\e900"; /* chevron-left */
  }
  
  /* Event positioning in RTL */
  .fc.fc-direction-rtl .fc-daygrid-event {
    text-align: right;
  }
  
  .fc.fc-direction-rtl .fc-daygrid-event-harness {
    margin-left: 0;
    margin-right: 2px;
  }
  
  /* Week numbers on right side in RTL */
  .fc.fc-direction-rtl .fc-daygrid-week-number {
    left: auto;
    right: 0;
  }
  
  /* Popover positioning in RTL */
  .fc.fc-direction-rtl .fc-popover {
    direction: rtl;
  }
  
  .fc.fc-direction-rtl .fc-popover-header {
    text-align: right;
  }
  
  .fc.fc-direction-rtl .fc-popover-body {
    text-align: right;
  }
`;

/**
 * Hook to get RTL calendar configuration
 * Automatically detects language context
 */
export function useRTLCalendarConfig() {
  // This would typically use your LanguageContext
  // For now, returning a function that accepts isRTL
  return (isRTL: boolean, locale?: string) => getRTLCalendarConfig(isRTL, locale);
}
