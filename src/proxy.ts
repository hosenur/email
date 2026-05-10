import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";
import { getSubdomainFromHost } from "@/lib/mailbox";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const subdomain = getSubdomainFromHost(request.headers.get("host") || "");

  if (subdomain) {
    // Allow /auth page to load normally
    if (pathname === "/auth") {
      return NextResponse.next();
    }

    // Allow /auth/* routes (like /auth/login, /auth/register) to load normally
    if (pathname.startsWith("/auth/")) {
      return NextResponse.next();
    }

    // Check if user is authenticated
    const sessionCookie = getSessionCookie(request);

    // If not authenticated, redirect to /auth
    if (!sessionCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth";
      return NextResponse.redirect(url);
    }

    // For authenticated users on root path, rewrite to subdomain inbox
    if (pathname === "/") {
      return NextResponse.rewrite(
        new URL(`/s/${subdomain}/inbox`, request.url),
      );
    }

    // Rewrite /inbox and /sent to subdomain routes
    if (pathname === "/inbox") {
      return NextResponse.rewrite(
        new URL(`/s/${subdomain}/inbox`, request.url),
      );
    }

    if (pathname === "/sent") {
      return NextResponse.rewrite(new URL(`/s/${subdomain}/sent`, request.url));
    }

    // Allow other paths normally for authenticated users
    return NextResponse.next();
  }

  // On the root domain (no subdomain), allow normal access to marketing landing page
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api|_next|[\\w-]+\\.\\w+).*)",
  ],
};
