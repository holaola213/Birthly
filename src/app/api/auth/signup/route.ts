import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signupSchema } from "@/lib/validators";
import { hashPassword, createSessionForResponse, SESSION_COOKIE_OPTIONS } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Check if username already taken
    const existingUsername = await prisma.user.findUnique({
      where: { username: parsed.data.username },
    });
    if (existingUsername) {
      return NextResponse.json(
        { error: { username: ["Username is already taken"] } },
        { status: 409 }
      );
    }

    // Check if phone already taken
    const existingPhone = await prisma.user.findUnique({
      where: { phone: parsed.data.phone },
    });
    if (existingPhone) {
      return NextResponse.json(
        { error: { phone: ["An account with this phone number already exists"] } },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);

    const user = await prisma.user.create({
      data: {
        username: parsed.data.username,
        passwordHash,
        name: parsed.data.name,
        birthday: parsed.data.birthday,
        birthdayYear: parsed.data.birthdayYear,
        phone: parsed.data.phone,
      },
    });

    const token = await createSessionForResponse({
      userId: user.id,
      username: user.username,
    });

    const response = NextResponse.json(
      { id: user.id, username: user.username, name: user.name },
      { status: 201 }
    );

    response.cookies.set(
      SESSION_COOKIE_OPTIONS.name,
      token,
      {
        httpOnly: SESSION_COOKIE_OPTIONS.httpOnly,
        secure: SESSION_COOKIE_OPTIONS.secure,
        sameSite: SESSION_COOKIE_OPTIONS.sameSite,
        maxAge: SESSION_COOKIE_OPTIONS.maxAge,
        path: SESSION_COOKIE_OPTIONS.path,
      }
    );

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
