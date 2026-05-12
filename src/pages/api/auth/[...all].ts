import { toNodeHandler } from "better-auth/node";
import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@/lib/auth";
import { getMailDomain, getRootDomainHost } from "@/lib/mailbox";

export const config = { api: { bodyParser: false } };

const authHandler = toNodeHandler(auth.handler);

function isAllowedAuthOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    const host = hostname.toLowerCase();
    const rootHost = getRootDomainHost().toLowerCase();
    const mailDomain = getMailDomain().toLowerCase();

    return (
      host === rootHost ||
      host === `www.${rootHost}` ||
      host === mailDomain ||
      host === `www.${mailDomain}` ||
      host.endsWith(`.${mailDomain}`) ||
      host === "localhost" ||
      host.endsWith(".localhost")
    );
  } catch {
    return false;
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const authPath = Array.isArray(req.query.all)
    ? req.query.all.join("/")
    : req.query.all;

  if (req.method === "POST" && authPath === "sign-up/email") {
    return res.status(403).json({
      error: "Account creation is restricted to administrators",
    });
  }

  const origin = req.headers.origin;

  if (origin && isAllowedAuthOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Vary", "Origin");
  }

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  return authHandler(req, res);
}
