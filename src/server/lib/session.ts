import { HTTPError } from "nitro";
import { getSubdomainFromHost, isEmailAllowedForSubdomain } from "@/lib/tenant";
import { auth } from "@/server/lib/auth";

export type AuthenticatedUser = {
  email: string;
  id: string;
  image?: string | null;
  name: string;
  role?: string | null;
};

type RequestEvent = {
  context: Record<string, unknown>;
  req: Request;
  url: URL;
};

function getRequestHost(event: RequestEvent) {
  return (
    event.req.headers.get("x-forwarded-host") ||
    event.req.headers.get("host") ||
    event.url.host
  );
}

export async function getCurrentUser(event: RequestEvent) {
  if (event.context.user) {
    return event.context.user as AuthenticatedUser | null;
  }

  const session = await auth.api.getSession({
    headers: event.req.headers,
  });
  const user = (session?.user ?? null) as AuthenticatedUser | null;

  event.context.user = user;

  return user;
}

export async function requireTenantUser(event: RequestEvent) {
  const user = await getCurrentUser(event);

  if (!user?.id) {
    throw HTTPError.status(401, "Unauthorized");
  }

  const subdomain = getSubdomainFromHost(getRequestHost(event));

  if (!isEmailAllowedForSubdomain(user.email, subdomain)) {
    throw HTTPError.status(403, "Forbidden");
  }

  return user;
}
