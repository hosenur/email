import { defineHandler } from "nitro";
import { prisma } from "@/server/lib/db";
import { requireTenantUser } from "@/server/lib/session";

export default defineHandler(async (event) => {
  const user = await requireTenantUser(event);
  const emailsParam = event.url.searchParams.get("emails");

  if (!emailsParam) {
    const currentUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        signature: true,
        image: true,
      },
    });

    return { user: currentUser };
  }

  const emails = emailsParam.split(",").map((email) => email.trim());

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

  return { users };
});
