import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Get session token from cookies
  const sessionToken =
    req.cookies["better-auth.session_token"] ||
    req.cookies["__Secure-better-auth.session_token"];

  if (!sessionToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Get the session and user
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ error: "Session expired" });
    }

    const userEmail = session.user.email;

    // Fetch emails for this user (minimal fields for list view)
    const emails = await prisma.email.findMany({
      where: { recipient: userEmail },
      orderBy: { receivedAt: "desc" },
      select: {
        id: true,
        from: true,
        subject: true,
        receivedAt: true,
        category: true,
        summary: true,
      },
    });

    return res.status(200).json({ emails });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
