import { createAvatar } from "@dicebear/core";
import { glass } from "@dicebear/collection";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const avatar = createAvatar(glass, {
            seed: user.email,
          });
          const avatarDataUri = await avatar.toDataUri();
          return {
            data: {
              ...user,
              image: avatarDataUri,
            },
          };
        },
      },
    },
  },
});
