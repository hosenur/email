import type { NextApiRequest, NextApiResponse } from "next";
import { getScopedSession } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { session, status, error } = await getScopedSession(req);

    if (!session) {
      return res.status(status).json({ error });
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
        opened: true,
      },
    });

    return res.status(200).json({ emails });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
