import { defineHandler, HTTPError } from "nitro";
import { prisma } from "@/server/lib/db";
import { requireTenantUser } from "@/server/lib/session";

export default defineHandler(async (event) => {
  const user = await requireTenantUser(event);
  const id = event.url.pathname.split("/").pop();

  if (!id) {
    throw HTTPError.status(400, "Email ID is required");
  }

  const email = await prisma.email.findUnique({
    where: { id },
  });

  if (!email) {
    throw HTTPError.status(404, "Email not found");
  }

  if (email.recipient !== user.email && email.fromEmail !== user.email) {
    throw HTTPError.status(403, "Forbidden");
  }

  if (!email.opened && email.recipient === user.email) {
    const openedEmail = await prisma.email.update({
      where: { id },
      data: { opened: true },
    });

    return { email: openedEmail };
  }

  return { email };
});
