import { defineHandler, HTTPError } from "nitro";
import { z } from "zod";
import { processInboundEmail } from "@/server/lib/inbound-email";
import { resend } from "@/server/lib/resend";

const ResendPayloadSchema = z.object({
  created_at: z.string(),
  data: z.object({
    attachments: z.array(z.any()),
    bcc: z.array(z.string()),
    cc: z.array(z.string()),
    created_at: z.string(),
    email_id: z.string(),
    from: z.string(),
    message_id: z.string(),
    subject: z.string(),
    to: z.array(z.string()),
  }),
  type: z.literal("email.received"),
});

const FetchedEmailSchema = z.object({
  object: z.literal("email"),
  id: z.string(),
  to: z.array(z.string()).min(1),
  from: z.string(),
  created_at: z.string(),
  subject: z.string(),
  message_id: z.string().optional(),
  bcc: z.array(z.string()).optional().default([]),
  cc: z.array(z.string()).optional().default([]),
  reply_to: z.array(z.string()).optional().default([]),
  html: z.string().nullable().optional(),
  text: z.string().nullable().optional(),
  headers: z.record(z.string(), z.any()),
  attachments: z.array(z.any()).default([]),
});

export default defineHandler(async (event) => {
  const parseResult = ResendPayloadSchema.safeParse(await event.req.json());

  if (!parseResult.success) {
    console.error("Invalid payload:", parseResult.error);
    throw HTTPError.status(400, "Invalid payload");
  }

  const payload = parseResult.data;

  const { data: email } = await resend.emails.receiving.get(
    payload.data.email_id,
  );

  const emailParseResult = FetchedEmailSchema.safeParse(email);

  if (!emailParseResult.success) {
    console.error(
      "Invalid email data fetched from Resend:",
      emailParseResult.error,
    );
    throw HTTPError.status(500, "Invalid email data from provider");
  }

  const fetchedEmail = emailParseResult.data;
  return processInboundEmail({
    provider: "resend",
    providerMessageId: payload.data.email_id,
    messageId: fetchedEmail.message_id || payload.data.message_id,
    from: fetchedEmail.from,
    to: fetchedEmail.to,
    cc: fetchedEmail.cc,
    bcc: fetchedEmail.bcc,
    replyTo: fetchedEmail.reply_to,
    subject: fetchedEmail.subject,
    text: fetchedEmail.text || null,
    html: fetchedEmail.html || null,
    receivedAt: fetchedEmail.created_at,
  });
});
