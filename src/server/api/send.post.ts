import { defineHandler, HTTPError } from "nitro";
import { z } from "zod";
import { prisma } from "@/server/lib/db";
import { resend } from "@/server/lib/resend";
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

  const resendAttachments = attachments.map((attachment) => ({
    filename: attachment.filename,
    content: Buffer.from(attachment.content, "base64"),
    contentType: attachment.contentType,
  }));

  const { data, error } = await resend.emails.send({
    from: `${user.name} <${user.email}>`,
    to,
    cc: cc.length > 0 ? cc : undefined,
    bcc: bcc.length > 0 ? bcc : undefined,
    subject,
    text: body,
    replyTo: replyTo || user.email,
    attachments: resendAttachments.length > 0 ? resendAttachments : undefined,
  });

  if (error) {
    console.error("Resend error:", error);
    throw HTTPError.status(500, "Failed to send email");
  }

  await prisma.email.create({
    data: {
      messageId: data?.id || "",
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
    messageId: data?.id,
    success: true,
  };
});
