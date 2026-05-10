import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;

export function createMailboxAuthClient(origin: string) {
  return createAuthClient({
    baseURL: `${origin}/api/auth`,
  });
}
