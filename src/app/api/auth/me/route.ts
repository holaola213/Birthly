import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { updateUserSchema } from "@/lib/validators";

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json(user);
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if ("response" in auth) return auth.response;

    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, birthday, phone } = parsed.data;

    // Check phone uniqueness (allow keeping the same phone)
    const existingPhone = await prisma.user.findUnique({
      where: { phone },
      select: { id: true },
    });

    if (existingPhone && existingPhone.id !== auth.user.id) {
      return NextResponse.json(
        { error: { phone: ["This phone number is already in use"] } },
        { status: 409 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: auth.user.id },
      data: { name, birthday, phone },
      select: {
        id: true,
        username: true,
        name: true,
        birthday: true,
        birthdayYear: true,
        phone: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Failed to update account. Please try again." },
      { status: 500 }
    );
  }
}
