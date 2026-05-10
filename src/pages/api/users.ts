import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { isAdminEmail } from "@/lib/admin";
import { getScopedSession } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

const UpdateUserSchema = z.object({
  name: z.string().optional(),
  signature: z.string().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    try {
      const { session, status, error } = await getScopedSession(req);

      if (!session) {
        return res.status(status).json({ error });
      }

      const emailsParam = req.query.emails as string;
      if (!emailsParam) {
        const user = await prisma.user.findUnique({
          where: {
            id: session.user.id,
          },
          select: {
            id: true,
            email: true,
            name: true,
            signature: true,
            image: true,
          },
        });

        return res.status(200).json({
          user: user
            ? {
                ...user,
                isAdmin: isAdminEmail(user.email),
              }
            : null,
        });
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

  if (req.method === "PATCH") {
    try {
      const { session, status, error } = await getScopedSession(req);

      if (!session) {
        return res.status(status).json({ error });
      }

      const parseResult = UpdateUserSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(400).json({
          error: "Invalid request body",
          details: parseResult.error.flatten(),
        });
      }

      const { name, signature } = parseResult.data;

      const user = await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          ...(name !== undefined && { name }),
          ...(signature !== undefined && { signature }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          signature: true,
          image: true,
        },
      });

      return res.status(200).json({ user });
    } catch (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
