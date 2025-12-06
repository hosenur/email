import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const url = request.nextUrl.clone();

  // Extract subdomain from hostname (e.g., xyz.hosenur.email -> xyz)
  const subdomain = hostname.split(".")[0];

  // Skip if no subdomain or if it's www/localhost
  if (!subdomain || subdomain === "www" || subdomain === "localhost") {
    return NextResponse.next();
  }

  // Skip if already on /auth page
  if (url.pathname === "/auth") {
    return NextResponse.next();
  }

  // Redirect to /auth with subdomain as query param
  url.pathname = "/auth";
  url.searchParams.set("subdomain", subdomain);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // Match all paths except static files and api routes
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)",
  ],
};
