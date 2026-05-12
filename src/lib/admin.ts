import type { NextApiRequest } from "next";
import { getScopedSession } from "@/lib/auth-session";

interface AdminUserCandidate {
  email?: string | null;
  role?: string | null;
}

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

export function hasAdminRole(role: string | null | undefined): boolean {
  if (!role) {
    return false;
  }

  return role
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .includes("admin");
}

export function isAdminUser(user: AdminUserCandidate): boolean {
  return isAdminEmail(user.email) || hasAdminRole(user.role);
}

export async function getAdminSession(req: NextApiRequest) {
  const sessionResult = await getScopedSession(req);

  if (!sessionResult.session) {
    return sessionResult;
  }

  if (!isAdminUser(sessionResult.session.user)) {
    return { session: null, status: 403, error: "Forbidden" };
  }

  return sessionResult;
}
