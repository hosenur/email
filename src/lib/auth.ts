import { glass } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
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
  ]),
);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
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
