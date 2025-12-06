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

    const emailsParam = req.query.emails as string;
    if (!emailsParam) {
      return res.status(400).json({ error: "emails parameter is required" });
    }

    const emails = emailsParam.split(",").map((e) => e.trim());

    const users = await prisma.user.findMany({
      where: {
        email: { in: emails },
      },
      select: {
        email: true,
        name: true,
        image: true,
      },
    });

    return res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
