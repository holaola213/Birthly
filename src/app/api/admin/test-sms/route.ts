import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { createSMSProvider } from "@/lib/sms";

// POST /api/admin/test-sms — send a test SMS
export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  const body = await request.json();
  const { to, message } = body;

  if (!to || !message) {
    return NextResponse.json(
      { error: "Both 'to' and 'message' fields are required" },
      { status: 400 }
    );
  }

  const sms = createSMSProvider();
  const result = await sms.sendSMS(to, message);

  return NextResponse.json(result);
}
