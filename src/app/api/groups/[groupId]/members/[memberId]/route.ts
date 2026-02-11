import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import { updateMemberSchema } from "@/lib/validators";

type Params = { params: Promise<{ groupId: string; memberId: string }> };

// PUT /api/groups/[groupId]/members/[memberId] — update a member
export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  const { groupId, memberId } = await params;
  const body = await request.json();
  const parsed = updateMemberSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const member = await prisma.member.findFirst({
    where: { id: memberId, groupId },
  });
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const updated = await prisma.member.update({
    where: { id: memberId },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}

// DELETE /api/groups/[groupId]/members/[memberId] — remove a member
export async function DELETE(_request: NextRequest, { params }: Params) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  const { groupId, memberId } = await params;

  const member = await prisma.member.findFirst({
    where: { id: memberId, groupId },
  });
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  await prisma.member.delete({ where: { id: memberId } });

  return NextResponse.json({ success: true });
}
