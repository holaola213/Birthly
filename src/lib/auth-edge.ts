import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-dev-secret-change-me"
);

// Types
export interface SessionPayload {
  userId: string;
  username: string;
}

// JWT verification (Edge-compatible, no Node.js modules)
export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// JWT creation (Edge-compatible)
export async function createSessionToken(
  payload: SessionPayload
): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
}

// Lightweight version for middleware (no DB call, Edge-compatible)
export async function getSessionFromToken(
  token: string
): Promise<SessionPayload | null> {
  return verifySessionToken(token);
}
