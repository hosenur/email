import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

function extractSubdomain(request: NextRequest): string | null {
  const url = request.url;
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0];

  // Local development environment
  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    // Try to extract subdomain from the full URL
    const fullUrlMatch = url.match(/http:\/\/([^.]+)\.localhost/);
    if (fullUrlMatch?.[1]) {
      return fullUrlMatch[1];
    }

    // Fallback to host header approach
    if (hostname.includes(".localhost")) {
      return hostname.split(".")[0];
    }

    return null;
  }

  // Production environment
  const rootDomainFormatted = ROOT_DOMAIN.split(":")[0];

  // Handle preview deployment URLs (tenant---branch-name.vercel.app)
  if (hostname.includes("---") && hostname.endsWith(".vercel.app")) {
    const parts = hostname.split("---");
    return parts.length > 0 ? parts[0] : null;
  }

  // Regular subdomain detection
  const isSubdomain =
    hostname !== rootDomainFormatted &&
    hostname !== `www.${rootDomainFormatted}` &&
    hostname.endsWith(`.${rootDomainFormatted}`);

  return isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, "") : null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const subdomain = extractSubdomain(request);

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
