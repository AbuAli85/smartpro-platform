import { forwardRef } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  showTimeSelect?: boolean;
  timeIntervals?: number;
  dateFormat?: string;
  minDate?: Date;
  maxDate?: Date;
  filterDate?: (date: Date) => boolean;
  filterTime?: (time: Date) => boolean;
  disabled?: boolean;
  className?: string;
  inline?: boolean;
  isClearable?: boolean;
}

// Custom input component with better mobile styling
const CustomInput = forwardRef<HTMLButtonElement, any>(({ value, onClick, placeholder, disabled }, ref) => (
  <button
    ref={ref}
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "flex items-center justify-between w-full px-4 py-3 text-left",
      "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg",
      "hover:border-[#003366] dark:hover:border-[#0055aa] transition-colors",
      "focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      "min-h-[44px]", // Minimum touch target size for mobile
      "text-base" // Prevent zoom on iOS
    )}
  >
    <span className={cn(
      "flex-1",
      !value && "text-gray-500 dark:text-gray-400"
    )}>
      {value || placeholder}
    </span>
    <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
  </button>
));

CustomInput.displayName = 'CustomInput';

export function DateTimePicker({
  selected,
  onChange,
  placeholderText = 'Select date',
  showTimeSelect = false,
  timeIntervals = 30,
  dateFormat = showTimeSelect ? 'MMM d, yyyy h:mm aa' : 'MMM d, yyyy',
  minDate,
  maxDate,
  filterDate,
  filterTime,
  disabled = false,
  className,
  inline = false,
  isClearable = true,
}: DateTimePickerProps) {
  return (
    <div className={cn("w-full", className)}>
      <ReactDatePicker
        selected={selected}
        onChange={onChange}
        placeholderText={placeholderText}
        showTimeSelect={showTimeSelect}
        timeIntervals={timeIntervals}
        dateFormat={dateFormat}
        minDate={minDate}
        maxDate={maxDate}
        filterDate={filterDate}
        filterTime={filterTime}
        disabled={disabled}
        inline={inline}
        isClearable={isClearable}
        customInput={<CustomInput />}
        calendarClassName="mobile-datepicker"
        popperClassName="mobile-datepicker-popper"
        showPopperArrow={false}
        // Mobile-friendly options
        withPortal={!inline}
        portalId="datepicker-portal"
        // Prevent keyboard on mobile (use native picker UI)
        onFocus={(e) => {
          if (window.innerWidth < 768) {
            e.target.blur();
          }
        }}
      />
    </div>
  );
}

// Time slot picker component for booking pages
interface TimeSlot {
  time: string;
  available: boolean;
}

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  className?: string;
}

export function TimeSlotPicker({ slots, selectedTime, onSelectTime, className }: TimeSlotPickerProps) {
  return (
    <div className={cn("grid grid-cols-3 sm:grid-cols-4 gap-2", className)}>
      {slots.map((slot) => (
        <button
          key={slot.time}
          onClick={() => slot.available && onSelectTime(slot.time)}
          disabled={!slot.available}
          className={cn(
            "px-4 py-3 rounded-lg text-sm font-medium transition-all",
            "min-h-[44px]", // Touch target size
            "border-2",
            selectedTime === slot.time
              ? "bg-[#003366] text-white border-[#003366]"
              : slot.available
              ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:border-[#003366] dark:hover:border-[#0055aa]"
              : "bg-gray-100 dark:bg-gray-900 text-gray-400 border-gray-200 dark:border-gray-800 cursor-not-allowed opacity-50"
          )}
        >
          {slot.time}
        </button>
      ))}
    </div>
  );
}

// Date range picker for availability editors
interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate,
  maxDate,
  className,
}: DateRangePickerProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4", className)}>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Start Date
        </label>
        <DateTimePicker
          selected={startDate}
          onChange={onStartDateChange}
          placeholderText="Select start date"
          minDate={minDate}
          maxDate={endDate || maxDate}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          End Date
        </label>
        <DateTimePicker
          selected={endDate}
          onChange={onEndDateChange}
          placeholderText="Select end date"
          minDate={startDate || minDate}
          maxDate={maxDate}
        />
      </div>
    </div>
  );
}
