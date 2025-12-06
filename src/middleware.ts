import { type NextRequest, NextResponse } from "next/server";
import { proxy, config as proxyConfig } from "./proxy";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0];
  const rootDomainFormatted = ROOT_DOMAIN.split(":")[0];

  // Redirect root domain (without www) to www subdomain
  if (hostname === rootDomainFormatted && !hostname.startsWith("www.")) {
    const url = request.nextUrl.clone();
    url.host = `www.${host}`;
    return NextResponse.redirect(url, 301);
  }

  // Continue with existing proxy logic
  return proxy(request);
}

export const config = proxyConfig;
