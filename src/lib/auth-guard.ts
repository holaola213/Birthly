import { NextResponse } from "next/server";
import { getSession, type SessionUser } from "@/lib/auth";

export async function requireAuth(): Promise<
  { user: SessionUser } | { response: NextResponse }
> {
  const user = await getSession();
  if (!user) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { user };
}
