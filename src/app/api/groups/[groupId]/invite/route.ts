import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import { createInviteLinkSchema } from "@/lib/validators";

type Params = { params: Promise<{ groupId: string }> };

// POST /api/groups/[groupId]/invite — generate an invite link
export async function POST(request: NextRequest, { params }: Params) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  const { groupId } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = createInviteLinkSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Check group exists
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  const expiresAt = parsed.data.expiresInDays
    ? new Date(Date.now() + parsed.data.expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  const inviteLink = await prisma.inviteLink.create({
    data: {
      groupId,
      expiresAt,
      maxUses: parsed.data.maxUses ?? null,
    },
  });

  return NextResponse.json(inviteLink, { status: 201 });
}
