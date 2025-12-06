import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { fromNodeHeaders } from "better-auth/node";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
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
    const query = (req.query.q as string) || "";

    if (!query.trim()) {
      return res.status(200).json({ emails: [] });
    }

    const emails = await prisma.email.findMany({
      where: {
        recipient: userEmail,
        OR: [
          { subject: { contains: query, mode: "insensitive" } },
          { from: { contains: query, mode: "insensitive" } },
          { textBody: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { receivedAt: "desc" },
      take: 10,
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
    console.error("Error searching emails:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
