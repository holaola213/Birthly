import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import { getDateAhead } from "@/lib/dates";
import { parseReminderDays, formatBirthdayMessage } from "@/lib/reminders";

// GET /api/admin/upcoming — preview which reminders would fire today
export async function GET() {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  const groups = await prisma.group.findMany({
    include: {
      members: true,
      reminderConfig: true,
    },
  });

  const upcoming: Array<{
    group: string;
    birthdayPerson: string;
    birthday: string;
    daysBefore: number;
    recipients: string[];
    message: string;
  }> = [];

  for (const group of groups) {
    const reminderDays = parseReminderDays(group.reminderConfig);
    const timezone = group.reminderConfig?.timezone || "America/New_York";

    for (const daysBefore of reminderDays) {
      const targetDate = getDateAhead(daysBefore, timezone);
      const birthdayMembers = group.members.filter(
        (m) => m.birthday === targetDate
      );

      for (const birthdayPerson of birthdayMembers) {
        const recipients = group.members
          .filter((m) => m.id !== birthdayPerson.id)
          .map((m) => m.name);

        upcoming.push({
          group: group.name,
          birthdayPerson: birthdayPerson.name,
          birthday: birthdayPerson.birthday,
          daysBefore,
          recipients,
          message: formatBirthdayMessage(
            birthdayPerson.name,
            daysBefore,
            birthdayPerson.birthday
          ),
        });
      }
    }
  }

  return NextResponse.json({ upcoming, checkedAt: new Date().toISOString() });
}
