import { createAvatar } from "@dicebear/core";
import { glass } from "@dicebear/collection";
import { prisma } from "../src/lib/prisma";

async function backfillAvatars() {
  console.log("Finding users without avatars...");

  const usersWithoutImage = await prisma.user.findMany({
    where: {
      OR: [{ image: null }, { image: "" }],
    },
    select: {
      id: true,
      email: true,
    },
  });

  console.log(`Found ${usersWithoutImage.length} users without avatars`);

  if (usersWithoutImage.length === 0) {
    console.log("No users to update");
    return;
  }

  for (const user of usersWithoutImage) {
    const avatar = createAvatar(glass, {
      seed: user.email,
    });
    const avatarDataUri = await avatar.toDataUri();

    await prisma.user.update({
      where: { id: user.id },
      data: { image: avatarDataUri },
    });

    console.log(`Updated avatar for ${user.email}`);
  }

  console.log("Done!");
}

backfillAvatars()
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
