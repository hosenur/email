import { glass } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { getMailDomain, getRootDomain, getRootDomainHost } from "@/lib/mailbox";
import { prisma } from "./prisma";

const ROOT_DOMAIN = getRootDomain();
const ROOT_DOMAIN_HOST = getRootDomainHost();
const MAIL_DOMAIN = getMailDomain();

const trustedOrigins = Array.from(
  new Set([
    `http://${ROOT_DOMAIN}`,
    `https://${ROOT_DOMAIN}`,
    `http://${ROOT_DOMAIN_HOST}`,
    `https://${ROOT_DOMAIN_HOST}`,
    `http://${MAIL_DOMAIN}`,
    `https://${MAIL_DOMAIN}`,
    `http://*.${MAIL_DOMAIN}`,
    `https://*.${MAIL_DOMAIN}`,
    "http://localhost:3000",
    "http://*.localhost:3000",
    "http://127.0.0.1:3000",
  ]),
);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [admin()],
  trustedOrigins,
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
