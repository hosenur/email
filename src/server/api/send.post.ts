import { defineHandler, HTTPError } from "nitro";
import { z } from "zod";
import { prisma } from "@/server/lib/db";
import {
  EmailDeliveryError,
  sendOutboundEmail,
} from "@/server/lib/email-delivery";
import { requireTenantUser } from "@/server/lib/session";

const AttachmentSchema = z.object({
  filename: z.string(),
  content: z.string(),
  contentType: z.string(),
});

const SendEmailSchema = z.object({
  to: z.array(z.email()).min(1, "At least one recipient is required"),
  cc: z.array(z.email()).optional().default([]),
  bcc: z.array(z.email()).optional().default([]),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  replyTo: z.email().optional(),
  attachments: z.array(AttachmentSchema).optional().default([]),
});

export default defineHandler(async (event) => {
  const user = await requireTenantUser(event);
  const parseResult = SendEmailSchema.safeParse(await event.req.json());

  if (!parseResult.success) {
    throw HTTPError.status(400, "Invalid request body");
  }

  const { to, cc, bcc, subject, body, replyTo, attachments } = parseResult.data;

  try {
    const sendResult = await sendOutboundEmail({
      from: `${user.name} <${user.email}>`,
      to,
      cc,
      bcc,
      subject,
      text: body,
      replyTo: replyTo || user.email,
      attachments,
    });

    await prisma.email.create({
      data: {
        messageId:
          sendResult.messageId ||
          `${sendResult.provider}:${Date.now()}:${crypto.randomUUID()}`,
        recipient: to[0],
        from: `${user.name} <${user.email}>`,
        fromEmail: user.email,
        to,
        cc,
        bcc,
        replyTo: replyTo ? [replyTo] : [user.email],
        subject,
        textBody: body,
        htmlBody: null,
        receivedAt: new Date(),
        opened: false,
        category: "Other",
        confidence: 0,
      },
    });

    return {
      messageId: sendResult.messageId,
      provider: sendResult.provider,
      success: true,
    };
  } catch (error) {
    if (error instanceof EmailDeliveryError) {
      console.error("Email delivery error:", error.details);
      throw HTTPError.status(error.status, error.message);
    }

    console.error("Error sending email:", error);
    throw HTTPError.status(500, "Internal server error");
  }
});
