import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Email ID is required" });
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

    // Fetch the specific email with full body
    const email = await prisma.email.findUnique({
      where: { id },
    });

    if (!email) {
      return res.status(404).json({ error: "Email not found" });
    }

    // Ensure user can only access their own emails
    if (email.recipient !== userEmail) {
      return res.status(403).json({ error: "Forbidden" });
    }

    return res.status(200).json({ email });
  } catch (error) {
    console.error("Error fetching email:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
