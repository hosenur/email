import { fromNodeHeaders } from "better-auth/node";
import type { NextApiRequest } from "next";
import { auth } from "@/lib/auth";
import { getMailboxEmail, getSubdomainFromHost } from "@/lib/mailbox";

export async function getScopedSession(req: NextApiRequest) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    return { session: null, status: 401, error: "Unauthorized" };
  }

  const host = req.headers.host || "";
  const subdomain = getSubdomainFromHost(host);

  if (subdomain) {
    const expectedEmail = getMailboxEmail(subdomain);

    if (session.user.email.toLowerCase() !== expectedEmail.toLowerCase()) {
      return { session: null, status: 403, error: "Forbidden" };
    }
  }

  return { session, status: 200, error: null };
}
