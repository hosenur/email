import { defineHandler, HTTPError } from "nitro";
import { z } from "zod";
import { processInboundEmail } from "@/server/lib/inbound-email";

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

function getBearerToken(request: Request): string | null {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length);
}

function isAuthorized(request: Request): boolean {
  const secret = process.env.CLOUDFLARE_EMAIL_WEBHOOK_SECRET;

  if (!secret) {
    return false;
  }

  return getBearerToken(request) === secret;
}

export default defineHandler(async (event) => {
  if (!process.env.CLOUDFLARE_EMAIL_WEBHOOK_SECRET) {
    throw HTTPError.status(
      500,
      "CLOUDFLARE_EMAIL_WEBHOOK_SECRET is not configured",
    );
  }

  if (!isAuthorized(event.req)) {
    throw HTTPError.status(401, "Unauthorized");
  }

  const parseResult = CloudflareInboundPayloadSchema.safeParse(
    await event.req.json(),
  );

  if (!parseResult.success) {
    throw HTTPError.status(400, "Invalid Cloudflare inbound payload");
  }

  const payload = parseResult.data;

  return processInboundEmail({
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
});
