import type { Member, ReminderConfig } from "@/generated/prisma/client";
import { formatBirthday } from "./dates";

/**
 * Build a birthday reminder message.
 */
export function formatBirthdayMessage(
  birthdayPersonName: string,
  daysBefore: number,
  birthday: string
): string {
  const formattedDate = formatBirthday(birthday);

  if (daysBefore === 0) {
    return `🎂 Today is ${birthdayPersonName}'s birthday (${formattedDate})! Don't forget to wish them a happy birthday! - BDay Reminder`;
  }

  if (daysBefore === 1) {
    return `🎂 Reminder: ${birthdayPersonName}'s birthday is TOMORROW (${formattedDate})! Don't forget to wish them a happy birthday! - BDay Reminder`;
  }

  if (daysBefore === 7) {
    return `🎂 Heads up! ${birthdayPersonName}'s birthday is in 1 week (${formattedDate}). Start thinking about a gift! - BDay Reminder`;
  }

  return `🎂 ${birthdayPersonName}'s birthday is in ${daysBefore} days (${formattedDate})! - BDay Reminder`;
}

/**
 * Parse the reminderDays JSON string from the database.
 */
export function parseReminderDays(config: ReminderConfig | null): number[] {
  if (!config) return [7, 1];
  try {
    const days = JSON.parse(config.reminderDays);
    return Array.isArray(days) ? days : [7, 1];
  } catch {
    return [7, 1];
  }
}

/**
 * Get members whose birthday matches the target "MM-DD" date.
 */
export function findBirthdayMembers(
  members: Member[],
  targetDate: string
): Member[] {
  return members.filter((m) => m.birthday === targetDate);
}

/**
 * Get all other members in the group (recipients for a birthday notification).
 */
export function getRecipients(
  members: Member[],
  birthdayPersonId: string
): Member[] {
  return members.filter((m) => m.id !== birthdayPersonId);
}
