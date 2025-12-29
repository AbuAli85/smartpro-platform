import { forwardRef } from 'react';
import ReactDatePicker, { ReactDatePickerProps } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useLanguage } from '@/contexts/LanguageContext';
import { ar } from 'date-fns/locale';

export const RTLDatePicker = forwardRef<any, ReactDatePickerProps>((props, ref) => {
  const { isRTL, currentLanguage } = useLanguage();

  return (
    <ReactDatePicker
      ref={ref}
      {...props}
      locale={currentLanguage === 'ar' ? ar : undefined}
      calendarClassName={isRTL ? 'rtl-datepicker' : ''}
      popperClassName={isRTL ? 'rtl-datepicker-popper' : ''}
      dateFormat={currentLanguage === 'ar' ? 'dd/MM/yyyy' : 'MM/dd/yyyy'}
    />
  );
});

RTLDatePicker.displayName = 'RTLDatePicker';
