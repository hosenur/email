import type { NextApiRequest, NextApiResponse } from "next";
import { getAdminEmails, getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

type CountGroup<Key extends string> = Record<Key, string> & {
  _count: { _all: number };
};

type MaxDateGroup<Key extends string> = Record<Key, string> & {
  _max: { receivedAt: Date | null };
};

function mapCounts<Key extends string>(
  groups: CountGroup<Key>[],
  key: Key,
): Map<string, number> {
  return new Map(groups.map((group) => [group[key], group._count._all]));
}

function mapMaxDates<Key extends string>(
  groups: MaxDateGroup<Key>[],
  key: Key,
): Map<string, Date | null> {
  return new Map(groups.map((group) => [group[key], group._max.receivedAt]));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { session, status, error } = await getAdminSession(req);

    if (!session) {
      return res.status(status).json({ error });
    }

    const usersPromise = prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        emailVerified: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    const totalEmailsPromise = prisma.email.count();
    const unreadEmailsPromise = prisma.email.count({
      where: { opened: false },
    });
    const categoryGroupsPromise = prisma.email.groupBy({
      by: ["category"],
      _count: { _all: true },
      orderBy: { _count: { category: "desc" } },
    });
    const recentEmailsPromise = prisma.email.findMany({
      orderBy: { receivedAt: "desc" },
      take: 12,
      select: {
        id: true,
        from: true,
        fromEmail: true,
        recipient: true,
        subject: true,
        category: true,
        opened: true,
        receivedAt: true,
      },
    });

    const users = await usersPromise;
    const userEmails = users.map((user) => user.email);

    const [
      totalEmails,
      unreadEmails,
      categoryGroups,
      recentEmails,
      receivedGroups,
      sentGroups,
      unreadGroups,
    ] = await Promise.all([
      totalEmailsPromise,
      unreadEmailsPromise,
      categoryGroupsPromise,
      recentEmailsPromise,
      prisma.email.groupBy({
        by: ["recipient"],
        where: { recipient: { in: userEmails } },
        _count: { _all: true },
        _max: { receivedAt: true },
      }),
      prisma.email.groupBy({
        by: ["fromEmail"],
        where: { fromEmail: { in: userEmails } },
        _count: { _all: true },
        _max: { receivedAt: true },
      }),
      prisma.email.groupBy({
        by: ["recipient"],
        where: {
          recipient: { in: userEmails },
          opened: false,
        },
        _count: { _all: true },
      }),
    ]);

    const receivedCounts = mapCounts(receivedGroups, "recipient");
    const sentCounts = mapCounts(sentGroups, "fromEmail");
    const unreadCounts = mapCounts(unreadGroups, "recipient");
    const lastReceivedAt = mapMaxDates(receivedGroups, "recipient");
    const lastSentAt = mapMaxDates(sentGroups, "fromEmail");
    const totalSentEmails = userEmails.reduce(
      (sum, email) => sum + (sentCounts.get(email) ?? 0),
      0,
    );

    return res.status(200).json({
      currentUser: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      },
      metrics: {
        users: users.length,
        totalEmails,
        unreadEmails,
        sentEmails: totalSentEmails,
      },
      providerConfig: {
        deliveryProvider:
          process.env.EMAIL_DELIVERY_PROVIDER?.trim().toLowerCase() || "resend",
        resendConfigured: Boolean(process.env.RESEND_API_KEY),
        cloudflareInboundConfigured: Boolean(
          process.env.CLOUDFLARE_EMAIL_WEBHOOK_SECRET,
        ),
        cloudflareOutboundConfigured: Boolean(
          process.env.CLOUDFLARE_EMAIL_OUTBOUND_URL &&
            process.env.CLOUDFLARE_EMAIL_OUTBOUND_SECRET,
        ),
        adminEmailsConfigured: getAdminEmails().length,
      },
      categoryBreakdown: categoryGroups.map((group) => ({
        category: group.category,
        count: group._count._all,
      })),
      users: users.map((user) => ({
        ...user,
        receivedCount: receivedCounts.get(user.email) ?? 0,
        sentCount: sentCounts.get(user.email) ?? 0,
        unreadCount: unreadCounts.get(user.email) ?? 0,
        lastReceivedAt: lastReceivedAt.get(user.email) ?? null,
        lastSentAt: lastSentAt.get(user.email) ?? null,
      })),
      recentEmails,
      generatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error fetching admin overview:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
