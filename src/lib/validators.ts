import { z } from "zod";

// Phone number in E.164 format
const phoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{1,14}$/, "Phone must be in E.164 format (e.g., +15551234567)");

// Birthday as MM-DD
const birthdaySchema = z
  .string()
  .regex(/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, "Birthday must be in MM-DD format");

export const createGroupSchema = z.object({
  name: z.string().min(1, "Group name is required").max(100),
});

export const addMemberSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  birthday: birthdaySchema,
  birthdayYear: z.number().int().min(1900).max(2100).optional(),
  phone: phoneSchema,
});

export const updateMemberSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  birthday: birthdaySchema.optional(),
  birthdayYear: z.number().int().min(1900).max(2100).nullable().optional(),
  phone: phoneSchema.optional(),
});

export const joinGroupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  birthday: birthdaySchema,
  birthdayYear: z.number().int().min(1900).max(2100).optional(),
  phone: phoneSchema,
});

export const updateReminderConfigSchema = z.object({
  reminderDays: z
    .array(z.number().int().min(0).max(30))
    .min(1, "At least one reminder day is required"),
  reminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:mm format"),
  timezone: z.string().min(1),
});

export const createInviteLinkSchema = z.object({
  expiresInDays: z.number().int().min(1).max(90).optional(),
  maxUses: z.number().int().min(1).max(1000).optional(),
});

// Auth schemas
export const signupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, hyphens, and underscores"
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
  name: z.string().min(1, "Name is required").max(100),
  birthday: birthdaySchema,
  birthdayYear: z.number().int().min(1900).max(2100).optional(),
  phone: phoneSchema,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  birthday: birthdaySchema,
  phone: phoneSchema,
});
