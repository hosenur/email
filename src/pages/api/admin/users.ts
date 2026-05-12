import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { getMailboxEmail, getMailboxOrigin } from "@/lib/mailbox";

const RESERVED_USERNAMES = new Set(["admin", "api", "auth", "mail", "www"]);
const SUBDOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

const CreateUserSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Username is required")
    .regex(SUBDOMAIN_PATTERN, "Use letters, numbers, or hyphens")
    .refine((value) => !RESERVED_USERNAMES.has(value), {
      message: "This username is reserved",
    }),
  name: z.string().trim().min(1, "Name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "body" in error &&
    typeof error.body === "object" &&
    error.body !== null &&
    "message" in error.body &&
    typeof error.body.message === "string"
  ) {
    return error.body.message;
  }

  return "Unable to create user";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { session, status, error } = await getAdminSession(req);

  if (!session) {
    return res.status(status).json({ error });
  }

  const parseResult = CreateUserSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      error: "Invalid request body",
      details: parseResult.error.flatten(),
    });
  }

  const { username, name, password } = parseResult.data;
  const email = getMailboxEmail(username);

  try {
    const createdUser = await auth.api.createUser({
      body: {
        email,
        password,
        name,
        role: "user",
      },
    });

    return res.status(201).json({
      user: createdUser.user,
      mailboxUrl: getMailboxOrigin(username),
    });
  } catch (error) {
    console.error("Error creating admin-managed user:", error);
    return res.status(400).json({ error: getErrorMessage(error) });
  }
}
