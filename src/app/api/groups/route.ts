import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import { createGroupSchema } from "@/lib/validators";

// GET /api/groups — list groups for the current user
export async function GET() {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  const groups = await prisma.group.findMany({
    where: { members: { some: { userId: auth.user.id } } },
    include: {
      members: true,
      reminderConfig: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(groups);
}

// POST /api/groups — create a new group (auto-adds creator as member)
export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  const body = await request.json();
  const parsed = createGroupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const group = await prisma.group.create({
    data: {
      name: parsed.data.name,
      createdById: auth.user.id,
      reminderConfig: {
        create: {
          reminderDays: "[7, 1]",
          reminderTime: "09:00",
          timezone: "America/New_York",
        },
      },
      members: {
        create: {
          name: auth.user.name,
          birthday: auth.user.birthday,
          birthdayYear: auth.user.birthdayYear,
          phone: auth.user.phone,
          userId: auth.user.id,
          isCreator: true,
        },
      },
    },
    include: {
      members: true,
      reminderConfig: true,
    },
  });

  return NextResponse.json(group, { status: 201 });
}
