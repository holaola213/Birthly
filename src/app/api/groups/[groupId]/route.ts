import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import { createGroupSchema } from "@/lib/validators";

type Params = { params: Promise<{ groupId: string }> };

// GET /api/groups/[groupId] — get group details with members
export async function GET(_request: NextRequest, { params }: Params) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  const { groupId } = await params;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: { orderBy: { birthday: "asc" } },
      inviteLinks: { orderBy: { createdAt: "desc" } },
      reminderConfig: true,
    },
  });

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  return NextResponse.json(group);
}

// PUT /api/groups/[groupId] — update group name
export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  const { groupId } = await params;
  const body = await request.json();
  const parsed = createGroupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const group = await prisma.group.update({
    where: { id: groupId },
    data: { name: parsed.data.name },
    include: { members: true, reminderConfig: true },
  });

  return NextResponse.json(group);
}

// DELETE /api/groups/[groupId] — delete a group
export async function DELETE(_request: NextRequest, { params }: Params) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  const { groupId } = await params;

  await prisma.group.delete({ where: { id: groupId } });

  return NextResponse.json({ success: true });
}
