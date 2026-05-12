import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [adminClient()],
});

export const { signIn, signOut, useSession } = authClient;

export function createMailboxAuthClient(origin: string) {
  return createAuthClient({
    baseURL: `${origin}/api/auth`,
  });
}
