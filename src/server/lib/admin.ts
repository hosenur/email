import { HTTPError } from "nitro";
import { prisma } from "@/server/lib/db";
import { getCurrentUser } from "@/server/lib/session";

type RequestEvent = Parameters<typeof getCurrentUser>[0];

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
  if (!email) return false;

  return getAdminEmails().includes(email.trim().toLowerCase());
}

export function hasAdminRole(role: string | null | undefined): boolean {
  if (!role) return false;

  return role
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .includes("admin");
}

export function isAdminUser(user: AdminUserCandidate): boolean {
  return isAdminEmail(user.email) || hasAdminRole(user.role);
}

export async function requireAdminUser(event: RequestEvent) {
  const user = await getCurrentUser(event);

  if (!user?.id) {
    throw HTTPError.status(401, "Unauthorized");
  }

  if (isAdminUser(user)) {
    return user;
  }

  const databaseUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { email: true, role: true },
  });

  if (!databaseUser || !isAdminUser(databaseUser)) {
    throw HTTPError.status(403, "Forbidden");
  }

  return user;
}
