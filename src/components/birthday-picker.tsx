"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

function getDaysInMonth(month: string): number {
  if (!month) return 31;
  const m = parseInt(month, 10);
  if ([4, 6, 9, 11].includes(m)) return 30;
  if (m === 2) return 29; // Allow 29 for leap years
  return 31;
}

interface BirthdayPickerProps {
  month: string;
  day: string;
  onMonthChange: (month: string) => void;
  onDayChange: (day: string) => void;
  disabled?: boolean;
}

export function BirthdayPicker({
  month,
  day,
  onMonthChange,
  onDayChange,
  disabled,
}: BirthdayPickerProps) {
  const maxDays = getDaysInMonth(month);

  function handleMonthChange(newMonth: string) {
    onMonthChange(newMonth);
    // Clamp day if current day exceeds new month's max
    const currentDay = parseInt(day, 10);
    const newMax = getDaysInMonth(newMonth);
    if (currentDay > newMax) {
      onDayChange(String(newMax).padStart(2, "0"));
    }
  }

  const days = Array.from({ length: maxDays }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );

  return (
    <div className="flex gap-2">
      <Select
        value={month}
        onValueChange={handleMonthChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={day} onValueChange={onDayChange} disabled={disabled}>
        <SelectTrigger className="w-[90px]">
          <SelectValue placeholder="Day" />
        </SelectTrigger>
        <SelectContent>
          {days.map((d) => (
            <SelectItem key={d} value={d}>
              {parseInt(d, 10)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
