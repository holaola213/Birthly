import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ token: string }> };

// GET /api/invite/[token] — validate an invite link
export async function GET(_request: NextRequest, { params }: Params) {
  const { token } = await params;

  const invite = await prisma.inviteLink.findUnique({
    where: { token },
    include: {
      group: {
        include: {
          members: { select: { name: true, birthday: true } },
        },
      },
    },
  });

  if (!invite) {
    return NextResponse.json({ error: "Invalid invite link" }, { status: 404 });
  }

  // Check expiration
  if (invite.expiresAt && invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "This invite link has expired" }, { status: 410 });
  }

  // Check max uses
  if (invite.maxUses && invite.useCount >= invite.maxUses) {
    return NextResponse.json(
      { error: "This invite link has reached its maximum uses" },
      { status: 410 }
    );
  }

  return NextResponse.json({
    groupName: invite.group.name,
    groupId: invite.group.id,
    memberCount: invite.group.members.length,
  });
}
