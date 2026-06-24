import { defineHandler } from "nitro";
import { prisma } from "@/server/lib/db";
import { requireTenantUser } from "@/server/lib/session";

export default defineHandler(async (event) => {
  const user = await requireTenantUser(event);

  const emails = await prisma.email.findMany({
    where: { recipient: user.email },
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

  return { emails };
});
