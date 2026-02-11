import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";

type Params = { params: Promise<{ token: string }> };

// POST /api/invite/[token]/join — join a group via invite link (uses session data)
export async function POST(_request: NextRequest, { params }: Params) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  const { token } = await params;
  const user = auth.user;

  // Validate invite
  const invite = await prisma.inviteLink.findUnique({
    where: { token },
    include: { group: true },
  });

  if (!invite) {
    return NextResponse.json({ error: "Invalid invite link" }, { status: 404 });
  }

  if (invite.expiresAt && invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "This invite link has expired" }, { status: 410 });
  }

  if (invite.maxUses && invite.useCount >= invite.maxUses) {
    return NextResponse.json(
      { error: "This invite link has reached its maximum uses" },
      { status: 410 }
    );
  }

  // Check for duplicate by userId or phone in same group
  const existing = await prisma.member.findFirst({
    where: {
      groupId: invite.groupId,
      OR: [
        { userId: user.id },
        { phone: user.phone },
      ],
    },
  });
  if (existing) {
    return NextResponse.json(
      { error: "You are already a member of this group" },
      { status: 409 }
    );
  }

  // Create member and increment use count in a transaction
  const [member] = await prisma.$transaction([
    prisma.member.create({
      data: {
        name: user.name,
        birthday: user.birthday,
        birthdayYear: user.birthdayYear,
        phone: user.phone,
        userId: user.id,
        groupId: invite.groupId,
      },
    }),
    prisma.inviteLink.update({
      where: { id: invite.id },
      data: { useCount: { increment: 1 } },
    }),
  ]);

  return NextResponse.json(
    { success: true, groupId: invite.groupId, groupName: invite.group.name, member },
    { status: 201 }
  );
}
