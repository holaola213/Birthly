import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import { updateReminderConfigSchema } from "@/lib/validators";

type Params = { params: Promise<{ groupId: string }> };

// GET /api/groups/[groupId]/reminders — get reminder settings
export async function GET(_request: NextRequest, { params }: Params) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  const { groupId } = await params;

  const config = await prisma.reminderConfig.findUnique({
    where: { groupId },
  });

  if (!config) {
    return NextResponse.json({ error: "Reminder config not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...config,
    reminderDays: JSON.parse(config.reminderDays),
  });
}

// PUT /api/groups/[groupId]/reminders — update reminder settings
export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  const { groupId } = await params;
  const body = await request.json();
  const parsed = updateReminderConfigSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const config = await prisma.reminderConfig.upsert({
    where: { groupId },
    update: {
      reminderDays: JSON.stringify(parsed.data.reminderDays),
      reminderTime: parsed.data.reminderTime,
      timezone: parsed.data.timezone,
    },
    create: {
      groupId,
      reminderDays: JSON.stringify(parsed.data.reminderDays),
      reminderTime: parsed.data.reminderTime,
      timezone: parsed.data.timezone,
    },
  });

  return NextResponse.json({
    ...config,
    reminderDays: JSON.parse(config.reminderDays),
  });
}
