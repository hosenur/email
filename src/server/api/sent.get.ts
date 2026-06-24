import { defineHandler } from "nitro";
import { prisma } from "@/server/lib/db";
import { requireTenantUser } from "@/server/lib/session";

export default defineHandler(async (event) => {
  const user = await requireTenantUser(event);

  const emails = await prisma.email.findMany({
    where: { fromEmail: user.email },
    orderBy: { receivedAt: "desc" },
    select: {
      id: true,
      from: true,
      to: true,
      subject: true,
      receivedAt: true,
      opened: true,
    },
  });

  return { emails };
});
