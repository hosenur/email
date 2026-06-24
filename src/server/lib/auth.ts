import { glass } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import {
  getMailDomain,
  getRootDomain,
  getRootHostname,
  getRootProtocol,
} from "@/lib/env";
import { prisma } from "@/server/lib/db";

const ROOT_DOMAIN = getRootDomain();
const ROOT_HOSTNAME = getRootHostname(ROOT_DOMAIN);
const ROOT_PROTOCOL = getRootProtocol(ROOT_DOMAIN);
const MAIL_DOMAIN = getMailDomain(ROOT_DOMAIN);
const MAIL_HOSTNAME = getRootHostname(MAIL_DOMAIN);
const IS_LOCALHOST =
  ROOT_HOSTNAME === "localhost" ||
  ROOT_HOSTNAME === "127.0.0.1" ||
  MAIL_HOSTNAME === "localhost" ||
  MAIL_HOSTNAME === "127.0.0.1";
const allowedHosts = [
  ROOT_HOSTNAME,
  `${ROOT_HOSTNAME}:*`,
  `*.${ROOT_HOSTNAME}`,
  `*.${ROOT_HOSTNAME}:*`,
  MAIL_HOSTNAME,
  `${MAIL_HOSTNAME}:*`,
  `*.${MAIL_HOSTNAME}`,
  `*.${MAIL_HOSTNAME}:*`,
  "localhost",
  "localhost:*",
  "*.localhost",
  "*.localhost:*",
  "127.0.0.1",
  "127.0.0.1:*",
];
const trustedOrigins = [
  `http://${ROOT_DOMAIN}`,
  `http://*.${ROOT_DOMAIN}`,
  `https://${ROOT_DOMAIN}`,
  `https://*.${ROOT_DOMAIN}`,
  `http://${MAIL_DOMAIN}`,
  `http://*.${MAIL_DOMAIN}`,
  `https://${MAIL_DOMAIN}`,
  `https://*.${MAIL_DOMAIN}`,
  `http://${ROOT_HOSTNAME}:*`,
  `http://*.${ROOT_HOSTNAME}:*`,
  "http://localhost:*",
  "http://*.localhost:*",
  "http://127.0.0.1:*",
  "https://localhost:*",
  "https://*.localhost:*",
  "https://127.0.0.1:*",
];

export const auth = betterAuth({
  baseURL: {
    allowedHosts,
    fallback: `${ROOT_PROTOCOL}://${ROOT_DOMAIN}`,
    protocol: "auto",
  },
  basePath: "/api/auth",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [admin()],
  trustedOrigins,
  advanced: {
    crossSubDomainCookies: {
      enabled: !IS_LOCALHOST && process.env.NODE_ENV === "production",
      domain: MAIL_HOSTNAME,
    },
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
