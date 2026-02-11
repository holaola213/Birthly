import type { Group, Member, InviteLink, ReminderConfig } from "@/generated/prisma/client";

export type GroupWithMembers = Group & {
  members: Member[];
  reminderConfig: ReminderConfig | null;
};

export type GroupWithAll = Group & {
  members: Member[];
  inviteLinks: InviteLink[];
  reminderConfig: ReminderConfig | null;
};

export type { Group, Member, InviteLink, ReminderConfig } from "@/generated/prisma/client";
