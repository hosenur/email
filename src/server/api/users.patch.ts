import { defineHandler, HTTPError } from "nitro";
import { z } from "zod";
import { prisma } from "@/server/lib/db";
import { requireTenantUser } from "@/server/lib/session";

const UpdateUserSchema = z.object({
  name: z.string().optional(),
  signature: z.string().optional(),
});

export default defineHandler(async (event) => {
  const user = await requireTenantUser(event);
  const parseResult = UpdateUserSchema.safeParse(await event.req.json());

  if (!parseResult.success) {
    throw HTTPError.status(400, "Invalid request body");
  }

  const { name, signature } = parseResult.data;

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
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

  return { user: updatedUser };
});
