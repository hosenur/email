import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { processInboundEmail } from "@/lib/inbound-email";
import { resend } from "@/lib/resend";

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const parseResult = ResendPayloadSchema.safeParse(req.body);

  if (!parseResult.success) {
    console.error("Invalid payload:", parseResult.error);
    return res
      .status(400)
      .json({ error: "Invalid payload", details: parseResult.error });
  }

  const payload = parseResult.data;

  try {
    const { data: email } = await resend.emails.receiving.get(
      payload.data.email_id,
    );

    const emailParseResult = FetchedEmailSchema.safeParse(email);

    if (!emailParseResult.success) {
      console.error(
        "Invalid email data fetched from Resend:",
        emailParseResult.error,
      );
      console.log("Failed data:", JSON.stringify(email, null, 2));
      return res.status(500).json({
        error: "Invalid email data from provider",
        details: emailParseResult.error,
      });
    }

    const fetchedEmail = emailParseResult.data;
    const result = await processInboundEmail({
      provider: "resend",
      providerMessageId: fetchedEmail.id,
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

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error processing email:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
