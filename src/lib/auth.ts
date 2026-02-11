import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import {
  createSessionToken,
  verifySessionToken,
} from "@/lib/auth-edge";

// Re-export types and edge-safe functions so existing imports from "@/lib/auth" still work
export type { SessionPayload } from "@/lib/auth-edge";
export { verifySessionToken, createSessionToken, getSessionFromToken } from "@/lib/auth-edge";

const COOKIE_NAME = "session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface SessionUser {
  id: string;
  username: string;
  name: string;
  birthday: string;
  birthdayYear: number | null;
  phone: string;
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Cookie options for session
export const SESSION_COOKIE_OPTIONS = {
  name: COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: COOKIE_MAX_AGE,
  path: "/",
};

// Set session cookie (for Server Components — uses next/headers cookies())
export async function setSessionCookie(
  payload: { userId: string; username: string }
): Promise<void> {
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

// Create a session token for use with NextResponse.cookies.set() in Route Handlers
export async function createSessionForResponse(
  payload: { userId: string; username: string }
): Promise<string> {
  return createSessionToken(payload);
}

// Clear session cookie
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Get current session from cookie (for Server Components and API routes)
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      username: true,
      name: true,
      birthday: true,
      birthdayYear: true,
      phone: true,
    },
  });

  return user;
}
