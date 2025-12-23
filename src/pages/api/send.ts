import { fromNodeHeaders } from "better-auth/node";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";

const SendEmailSchema = z.object({
  to: z.array(z.email()).min(1, "At least one recipient is required"),
  cc: z.array(z.email()).optional().default([]),
  bcc: z.array(z.email()).optional().default([]),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  replyTo: z.email().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userEmail = session.user.email;
    const userName = session.user.name;

    const parseResult = SendEmailSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        error: "Invalid request body",
        details: parseResult.error.flatten(),
      });
    }

    const { to, cc, bcc, subject, body, replyTo } = parseResult.data;

    const { data, error } = await resend.emails.send({
      from: `${userName} <${userEmail}>`,
      to,
      cc: cc.length > 0 ? cc : undefined,
      bcc: bcc.length > 0 ? bcc : undefined,
      subject,
      text: body,
      replyTo: replyTo || userEmail,
    });

    if (error) {
      console.error("Resend error:", error);
      return res
        .status(500)
        .json({ error: "Failed to send email", details: error });
    }

    await prisma.email.create({
      data: {
        messageId: data?.id || "",
        recipient: to[0],
        from: `${userName} <${userEmail}>`,
        fromEmail: userEmail,
        to,
        cc,
        bcc,
        replyTo: replyTo ? [replyTo] : [userEmail],
        subject,
        textBody: body,
        htmlBody: null,
        receivedAt: new Date(),
        opened: false,
        category: "Other",
        confidence: 0,
      },
    });

    return res.status(200).json({
      success: true,
      messageId: data?.id,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
