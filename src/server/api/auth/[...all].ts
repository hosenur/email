import { defineHandler, HTTPError } from "nitro";
import { getSubdomainFromHost, isEmailAllowedForSubdomain } from "@/lib/tenant";
import { auth } from "@/server/lib/auth";

function isEmailAuthPath(pathname: string) {
  return (
    pathname.endsWith("/sign-in/email") || pathname.endsWith("/sign-up/email")
  );
}

function getRequestHost(request: Request) {
  return (
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    new URL(request.url).host
  );
}

async function getRequestEmail(request: Request) {
  const body = await request
    .clone()
    .json()
    .catch(() => null);

  if (!body || typeof body !== "object" || !("email" in body)) {
    return null;
  }

  return typeof body.email === "string" ? body.email : null;
}

export default defineHandler(async (event) => {
  const request = event.req;
  const url = new URL(request.url);

  if (request.method === "POST" && isEmailAuthPath(url.pathname)) {
    const subdomain = getSubdomainFromHost(getRequestHost(request));
    const email = await getRequestEmail(request);

    if (email && !isEmailAllowedForSubdomain(email, subdomain)) {
      throw HTTPError.status(403, "Email does not belong to this subdomain");
    }
  }

  return auth.handler(event.req);
});
