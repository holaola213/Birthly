import "dotenv/config";
import cron from "node-cron";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { getDateAhead, getCurrentHour, getCurrentYear } from "../src/lib/dates.js";
import { parseReminderDays, formatBirthdayMessage, findBirthdayMembers, getRecipients } from "../src/lib/reminders.js";
import { createSMSProvider } from "../src/lib/sms.js";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });
const sms = createSMSProvider();

async function checkAndSendReminders() {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] Running birthday reminder check...`);

  const groups = await prisma.group.findMany({
    include: {
      members: true,
      reminderConfig: true,
    },
  });

  let totalSent = 0;
  let totalSkipped = 0;

  for (const group of groups) {
    const config = group.reminderConfig;
    const timezone = config?.timezone ?? "America/New_York";
    const reminderTime = config?.reminderTime ?? "09:00";
    const reminderDays = parseReminderDays(config);

    // Check if current hour matches this group's configured send time
    const currentHour = getCurrentHour(timezone);
    const configuredHour = parseInt(reminderTime.split(":")[0], 10);

    if (currentHour !== configuredHour) {
      continue; // Not time yet for this group
    }

    const currentYear = getCurrentYear(timezone);

    for (const daysBefore of reminderDays) {
      const targetDate = getDateAhead(daysBefore, timezone);
      const birthdayMembers = findBirthdayMembers(group.members, targetDate);

      for (const birthdayPerson of birthdayMembers) {
        const recipients = getRecipients(group.members, birthdayPerson.id);

        for (const recipient of recipients) {
          // Check if we already sent this reminder (idempotency)
          const alreadySent = await prisma.sentReminder.findUnique({
            where: {
              memberId_recipientPhone_daysBefore_year: {
                memberId: birthdayPerson.id,
                recipientPhone: recipient.phone,
                daysBefore,
                year: currentYear,
              },
            },
          });

          if (alreadySent) {
            totalSkipped++;
            continue;
          }

          // Send SMS
          const message = formatBirthdayMessage(
            birthdayPerson.name,
            daysBefore,
            birthdayPerson.birthday
          );
          const result = await sms.sendSMS(recipient.phone, message);

          // Record the sent reminder if successful
          if (result.success) {
            await prisma.sentReminder.create({
              data: {
                memberId: birthdayPerson.id,
                recipientPhone: recipient.phone,
                daysBefore,
                year: currentYear,
              },
            });
            totalSent++;
            console.log(
              `  Sent reminder to ${recipient.name} about ${birthdayPerson.name}'s birthday (${daysBefore}d before)`
            );
          } else {
            console.error(
              `  Failed to send to ${recipient.name}: ${result.error}`
            );
          }
        }
      }
    }
  }

  console.log(
    `[${new Date().toISOString()}] Check complete. Sent: ${totalSent}, Skipped (already sent): ${totalSkipped}`
  );
}

// Run every hour at minute 0
cron.schedule("0 * * * *", () => {
  checkAndSendReminders().catch(console.error);
});

console.log("Birthday reminder scheduler started.");
console.log("Checking every hour at :00 for upcoming birthdays.");
console.log(`SMS Provider: ${process.env.SMS_PROVIDER || "console"}`);

// Also run immediately on startup for testing
checkAndSendReminders().catch(console.error);
