import { fromNodeHeaders } from "better-auth/node";
import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@/lib/auth";
import { mistral } from "@/lib/mistral";
import { prisma } from "@/lib/prisma";

async function generateTldr(
  emails: { from: string; subject: string; summary: string | null }[],
) {
  try {
    const emailSummaries = emails
      .map(
        (e, i) =>
          `${i + 1}. From: ${e.from}\n   Subject: ${e.subject}\n   Summary: ${e.summary || "No summary available"}`,
      )
      .join("\n\n");

    const chatResponse = await mistral.chat.complete({
      model: "mistral-large-latest",
      messages: [
        {
          role: "system",
          content:
            "You are an email assistant. Generate a brief, friendly TLDR summary of the user's unread emails. Keep it concise (2-4 sentences max). Focus on what's most important or actionable. Use a casual, helpful tone.",
        },
        {
          role: "user",
          content: `Here are my ${emails.length} unread emails:\n\n${emailSummaries}\n\nGive me a quick TLDR of what I need to know.`,
        },
      ],
    });

    if (chatResponse.choices?.[0]?.message?.content) {
      const content = chatResponse.choices[0].message.content;
      return typeof content === "string"
        ? content
        : Array.isArray(content)
          ? content.map((chunk) => ("text" in chunk ? chunk.text : "")).join("")
          : String(content);
    }

    return null;
  } catch (error) {
    console.error("Mistral API Error:", error);
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get session using better-auth
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userEmail = session.user.email;

    // Fetch top 5 unopened emails
    const unopenedEmails = await prisma.email.findMany({
      where: {
        recipient: userEmail,
        opened: false,
      },
      orderBy: { receivedAt: "desc" },
      take: 5,
      select: {
        id: true,
        from: true,
        subject: true,
        summary: true,
        receivedAt: true,
      },
    });

    if (unopenedEmails.length === 0) {
      return res.status(200).json({
        tldr: null,
        message: "No unread emails",
        count: 0,
      });
    }

    // Generate TLDR using Mistral, or fallback to summaries
    let tldr = await generateTldr(unopenedEmails);

    // Fallback: if Mistral fails, use the email summaries directly
    if (!tldr && unopenedEmails.length > 0) {
      const summaries = unopenedEmails
        .filter((e) => e.summary)
        .map((e) => `${e.subject}: ${e.summary}`)
        .join(" ");
      tldr = summaries || null;
    }

    return res.status(200).json({
      tldr,
      count: unopenedEmails.length,
      emails: unopenedEmails,
    });
  } catch (error) {
    console.error("Error generating TLDR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
