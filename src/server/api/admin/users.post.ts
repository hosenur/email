import { defineHandler, HTTPError } from "nitro";
import { z } from "zod";
import { getMailboxEmail, getMailboxOrigin } from "@/lib/mailbox";
import { requireAdminUser } from "@/server/lib/admin";
import { auth } from "@/server/lib/auth";

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

export default defineHandler(async (event) => {
  await requireAdminUser(event);

  const parseResult = CreateUserSchema.safeParse(await event.req.json());

  if (!parseResult.success) {
    throw HTTPError.status(400, "Invalid request body");
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

    return {
      mailboxUrl: getMailboxOrigin(username),
      user: createdUser.user,
    };
  } catch (error) {
    console.error("Error creating admin-managed user:", error);
    throw HTTPError.status(400, getErrorMessage(error));
  }
});
