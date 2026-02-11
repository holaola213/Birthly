import { NextRequest, NextResponse } from "next/server";
import { getSessionFromToken } from "@/lib/auth-edge";

const PUBLIC_PAGES = ["/", "/login", "/signup"];
const AUTH_PAGES = ["/login", "/signup"]; // redirect away if already logged in

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("session")?.value;

  // Allow API routes for auth endpoints
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // Allow public invite validation API (GET only)
  if (pathname.startsWith("/api/invite/") && request.method === "GET") {
    return NextResponse.next();
  }

  // For all other API routes, check auth
  if (pathname.startsWith("/api/")) {
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const session = await getSessionFromToken(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Invite join page is accessible without auth
  // (the page itself handles logged-in vs not-logged-in UX)
  if (pathname.startsWith("/join/")) {
    return NextResponse.next();
  }

  const session = token ? await getSessionFromToken(token) : null;

  // Redirect logged-in users away from auth pages to dashboard
  if (session && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Landing page: redirect logged-in users to dashboard
  if (session && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users to login (except public pages)
  if (!session && !PUBLIC_PAGES.includes(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and _next
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.gif$|.*\\.ico$|.*\\.webp$).*)",
  ],
};
