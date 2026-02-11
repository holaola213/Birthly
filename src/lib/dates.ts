/**
 * Format a "MM-DD" birthday string to a human-readable format.
 * e.g., "03-15" → "March 15"
 */
export function formatBirthday(monthDay: string): string {
  const [month, day] = monthDay.split("-").map(Number);
  const date = new Date(2000, month - 1, day);
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

/**
 * Get today's date as "MM-DD" in the given timezone.
 */
export function getTodayMMDD(timezone: string): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(now);
  const month = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;
  return `${month}-${day}`;
}

/**
 * Get the current hour in the given timezone.
 */
export function getCurrentHour(timezone: string): number {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    hour12: false,
  });
  return parseInt(formatter.format(now), 10);
}

/**
 * Get the date that is `daysAhead` days from today in the given timezone, as "MM-DD".
 */
export function getDateAhead(daysAhead: number, timezone: string): string {
  const now = new Date();
  // Get today in the timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(now);
  const year = parseInt(parts.find((p) => p.type === "year")!.value, 10);
  const month = parseInt(parts.find((p) => p.type === "month")!.value, 10);
  const day = parseInt(parts.find((p) => p.type === "day")!.value, 10);

  const future = new Date(year, month - 1, day + daysAhead);
  const m = String(future.getMonth() + 1).padStart(2, "0");
  const d = String(future.getDate()).padStart(2, "0");
  return `${m}-${d}`;
}

/**
 * Get the current year in the given timezone.
 */
export function getCurrentYear(timezone: string): number {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
  });
  return parseInt(formatter.format(now), 10);
}

/**
 * Calculate age from birth year to current year.
 */
export function calculateAge(birthYear: number, timezone: string): number {
  return getCurrentYear(timezone) - birthYear;
}

/**
 * Calculate days until the next occurrence of a "MM-DD" birthday from today.
 * Returns 0 if today is the birthday.
 */
export function daysUntilBirthday(monthDay: string, timezone: string): number {
  const [month, day] = monthDay.split("-").map(Number);
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(now);
  const currentYear = parseInt(parts.find((p) => p.type === "year")!.value, 10);
  const currentMonth = parseInt(parts.find((p) => p.type === "month")!.value, 10);
  const currentDay = parseInt(parts.find((p) => p.type === "day")!.value, 10);

  const today = new Date(currentYear, currentMonth - 1, currentDay);
  let birthday = new Date(currentYear, month - 1, day);

  if (birthday < today) {
    birthday = new Date(currentYear + 1, month - 1, day);
  }

  return Math.round(
    (birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}
