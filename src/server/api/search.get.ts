import { defineHandler } from "nitro";
import { prisma } from "@/server/lib/db";
import { requireTenantUser } from "@/server/lib/session";

export default defineHandler(async (event) => {
  const user = await requireTenantUser(event);
  const query = event.url.searchParams.get("q") ?? "";

  if (!query.trim()) {
    return { emails: [] };
  }

  const emails = await prisma.email.findMany({
    where: {
      recipient: user.email,
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

  return { emails };
});
