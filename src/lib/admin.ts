import type { NextApiRequest } from "next";
import { getScopedSession } from "@/lib/auth-session";

export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }

  return getAdminEmails().includes(email.trim().toLowerCase());
}

export async function getAdminSession(req: NextApiRequest) {
  const sessionResult = await getScopedSession(req);

  if (!sessionResult.session) {
    return sessionResult;
  }

  if (!isAdminEmail(sessionResult.session.user.email)) {
    return { session: null, status: 403, error: "Forbidden" };
  }

  return sessionResult;
}
