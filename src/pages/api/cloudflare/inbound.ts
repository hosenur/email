import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { processInboundEmail } from "@/lib/inbound-email";

const CloudflareInboundPayloadSchema = z.object({
  provider: z.literal("cloudflare"),
  envelope: z.object({
    from: z.string(),
    to: z.string(),
  }),
  rawSize: z.number().nonnegative().optional(),
  email: z.object({
    messageId: z.string().nullable().optional(),
    from: z.string().nullable().optional(),
    to: z.array(z.string()).default([]),
    cc: z.array(z.string()).default([]),
    bcc: z.array(z.string()).default([]),
    replyTo: z.array(z.string()).default([]),
    subject: z.string().nullable().optional(),
    text: z.string().nullable().optional(),
    html: z.string().nullable().optional(),
    date: z.string().nullable().optional(),
    headers: z.record(z.string(), z.string()).default({}),
  }),
});

function getBearerToken(req: NextApiRequest): string | null {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length);
}

function isAuthorized(req: NextApiRequest): boolean {
  const secret = process.env.CLOUDFLARE_EMAIL_WEBHOOK_SECRET;

  if (!secret) {
    return false;
  }

  return getBearerToken(req) === secret;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.CLOUDFLARE_EMAIL_WEBHOOK_SECRET) {
    return res
      .status(500)
      .json({ error: "CLOUDFLARE_EMAIL_WEBHOOK_SECRET is not configured" });
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const parseResult = CloudflareInboundPayloadSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      error: "Invalid Cloudflare inbound payload",
      details: parseResult.error.flatten(),
    });
  }

  const payload = parseResult.data;
  const result = await processInboundEmail({
    provider: "cloudflare",
    providerMessageId:
      payload.email.messageId || payload.email.headers["message-id"] || null,
    messageId: payload.email.messageId || payload.email.headers["message-id"],
    from: payload.email.from || payload.envelope.from,
    to: payload.email.to.length > 0 ? payload.email.to : [payload.envelope.to],
    cc: payload.email.cc,
    bcc: payload.email.bcc,
    replyTo: payload.email.replyTo,
    subject: payload.email.subject || "No subject",
    text: payload.email.text || null,
    html: payload.email.html || null,
    receivedAt: payload.email.date,
  });

  return res.status(200).json(result);
}
