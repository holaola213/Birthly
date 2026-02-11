import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean existing data
  await prisma.sentReminder.deleteMany();
  await prisma.inviteLink.deleteMany();
  await prisma.reminderConfig.deleteMany();
  await prisma.member.deleteMany();
  await prisma.group.deleteMany();
  await prisma.user.deleteMany();

  // Create a test user
  const passwordHash = await bcrypt.hash("password123", 12);
  const testUser = await prisma.user.create({
    data: {
      username: "alice",
      passwordHash,
      name: "Alice",
      birthday: "03-15",
      phone: "+15551111111",
    },
  });

  const testUser2 = await prisma.user.create({
    data: {
      username: "bob",
      passwordHash,
      name: "Bob",
      birthday: "07-22",
      phone: "+15552222222",
    },
  });

  // Create a sample group owned by Alice
  const group = await prisma.group.create({
    data: {
      name: "Best Friends",
      createdById: testUser.id,
      reminderConfig: {
        create: {
          reminderDays: "[7, 1]",
          reminderTime: "09:00",
          timezone: "America/New_York",
        },
      },
      members: {
        create: [
          {
            name: "Alice",
            birthday: "03-15",
            phone: "+15551111111",
            userId: testUser.id,
            isCreator: true,
          },
          {
            name: "Bob",
            birthday: "07-22",
            phone: "+15552222222",
            userId: testUser2.id,
          },
          {
            name: "Charlie",
            birthday: "12-01",
            phone: "+15553333333",
          },
        ],
      },
      inviteLinks: {
        create: {
          token: "demo-invite-link",
        },
      },
    },
  });

  // Create a second group owned by Alice
  const family = await prisma.group.create({
    data: {
      name: "Family",
      createdById: testUser.id,
      reminderConfig: {
        create: {
          reminderDays: "[7, 1]",
          reminderTime: "10:00",
          timezone: "America/New_York",
        },
      },
      members: {
        create: [
          {
            name: "Alice",
            birthday: "03-15",
            phone: "+15551111111",
            userId: testUser.id,
            isCreator: true,
          },
          {
            name: "Dad",
            birthday: "09-03",
            phone: "+15555555555",
          },
        ],
      },
    },
  });

  console.log("Seeded database:");
  console.log(`  User "${testUser.username}" (password: password123)`);
  console.log(`  User "${testUser2.username}" (password: password123)`);
  console.log(`  Group "${group.name}" with 3 members`);
  console.log(`  Group "${family.name}" with 2 members`);
  console.log(`  Invite link: /join/demo-invite-link`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
