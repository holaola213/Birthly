import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import { addMemberSchema } from "@/lib/validators";

type Params = { params: Promise<{ groupId: string }> };

// POST /api/groups/[groupId]/members — add a member to a group
export async function POST(request: NextRequest, { params }: Params) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  const { groupId } = await params;
  const body = await request.json();
  const parsed = addMemberSchema.safeParse(body);

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

  // Check for duplicate phone in same group
  const existing = await prisma.member.findUnique({
    where: { phone_groupId: { phone: parsed.data.phone, groupId } },
  });
  if (existing) {
    return NextResponse.json(
      { error: "A member with this phone number already exists in this group" },
      { status: 409 }
    );
  }

  const member = await prisma.member.create({
    data: {
      name: parsed.data.name,
      birthday: parsed.data.birthday,
      birthdayYear: parsed.data.birthdayYear,
      phone: parsed.data.phone,
      groupId,
    },
  });

  return NextResponse.json(member, { status: 201 });
}
