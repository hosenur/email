"use client";

import Head from "next/head";
import useSWR from "swr";
import {
  InboxIcon,
  PaperAirplaneIcon,
  ShieldCheckIcon,
  UserIcon,
} from "@/components/icons/lucide";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthLayout } from "@/layout/auth-layout";

interface AdminMetric {
  users: number;
  totalEmails: number;
  unreadEmails: number;
  sentEmails: number;
}

interface ProviderConfig {
  deliveryProvider: string;
  resendConfigured: boolean;
  cloudflareInboundConfigured: boolean;
  cloudflareOutboundConfigured: boolean;
  adminEmailsConfigured: number;
}

interface CategoryBreakdown {
  category: string;
  count: number;
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  image: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  receivedCount: number;
  sentCount: number;
  unreadCount: number;
  lastReceivedAt: string | null;
  lastSentAt: string | null;
}

interface RecentEmail {
  id: string;
  from: string;
  fromEmail: string;
  recipient: string;
  subject: string;
  category: string;
  opened: boolean;
  receivedAt: string;
}

interface AdminOverviewResponse {
  currentUser: {
    id: string;
    email: string;
    name: string;
  };
  metrics: AdminMetric;
  providerConfig: ProviderConfig;
  categoryBreakdown: CategoryBreakdown[];
  users: AdminUser[];
  recentEmails: RecentEmail[];
  generatedAt: string;
}

interface FetchError extends Error {
  status?: number;
}

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });

  if (!res.ok) {
    const error = new Error("Failed to fetch admin overview") as FetchError;
    error.status = res.status;
    throw error;
  }

  return res.json() as Promise<AdminOverviewResponse>;
};

const loadingMetricIds = ["users", "received", "unread", "sent"];

function formatDate(value: string | null): string {
  if (!value) {
    return "Never";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getLastActivity(user: AdminUser): string | null {
  const dates = [user.lastReceivedAt, user.lastSentAt]
    .filter(Boolean)
    .map((value) => new Date(value as string).getTime());

  if (dates.length === 0) {
    return null;
  }

  return new Date(Math.max(...dates)).toISOString();
}

function MetricTile({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: number;
  detail: string;
  icon: typeof UserIcon;
}) {
  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-fg">{label}</p>
        <Icon className="size-4 text-muted-fg" />
      </div>
      <div className="mt-3 flex items-end gap-2">
        <span className="font-semibold text-2xl text-fg tabular-nums">
          {value.toLocaleString()}
        </span>
        <span className="pb-1 text-sm text-muted-fg">{detail}</span>
      </div>
    </div>
  );
}

function StatusBadge({ ready }: { ready: boolean }) {
  return (
    <Badge intent={ready ? "success" : "warning"} isCircle={false}>
      {ready ? "Ready" : "Missing"}
    </Badge>
  );
}

function ProviderPanel({ config }: { config: ProviderConfig }) {
  const rows = [
    {
      label: "Resend API key",
      ready: config.resendConfigured,
      value: config.resendConfigured ? "Configured" : "Not set",
    },
    {
      label: "Cloudflare inbound secret",
      ready: config.cloudflareInboundConfigured,
      value: config.cloudflareInboundConfigured ? "Configured" : "Not set",
    },
    {
      label: "Cloudflare outbound worker",
      ready: config.cloudflareOutboundConfigured,
      value: config.cloudflareOutboundConfigured ? "Configured" : "Not set",
    },
    {
      label: "Admin emails",
      ready: config.adminEmailsConfigured > 0,
      value: `${config.adminEmailsConfigured} configured`,
    },
  ];

  return (
    <section className="rounded-lg border border-border bg-secondary/40">
      <div className="flex items-center justify-between border-border border-b px-4 py-3">
        <div>
          <h2 className="font-medium text-fg text-sm">Provider setup</h2>
          <p className="text-muted-fg text-sm">
            Outbound: {config.deliveryProvider}
          </p>
        </div>
        <Badge intent="outline" isCircle={false}>
          Pre-deploy
        </Badge>
      </div>
      <div className="divide-y divide-border">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 px-4 py-3"
          >
            <div>
              <p className="font-medium text-fg text-sm">{row.label}</p>
              <p className="text-muted-fg text-sm">{row.value}</p>
            </div>
            <StatusBadge ready={row.ready} />
          </div>
        ))}
      </div>
    </section>
  );
}

function CategoryPanel({
  categories,
  totalEmails,
}: {
  categories: CategoryBreakdown[];
  totalEmails: number;
}) {
  return (
    <section className="rounded-lg border border-border bg-secondary/40 p-4">
      <h2 className="font-medium text-fg text-sm">Categories</h2>
      <div className="mt-4 space-y-3">
        {categories.length === 0 ? (
          <p className="text-muted-fg text-sm">No email categories yet</p>
        ) : (
          categories.map((category) => {
            const width =
              totalEmails > 0
                ? Math.max((category.count / totalEmails) * 100, 3)
                : 0;

            return (
              <div key={category.category}>
                <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                  <span className="text-fg">{category.category}</span>
                  <span className="text-muted-fg tabular-nums">
                    {category.count.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

function UsersTable({ users }: { users: AdminUser[] }) {
  return (
    <section className="rounded-lg border border-border bg-secondary/40">
      <div className="border-border border-b px-4 py-3">
        <h2 className="font-medium text-fg text-sm">Users</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-border border-b text-muted-fg">
            <tr>
              <th className="px-4 py-2 font-medium">User</th>
              <th className="px-4 py-2 font-medium">Received</th>
              <th className="px-4 py-2 font-medium">Unread</th>
              <th className="px-4 py-2 font-medium">Sent</th>
              <th className="px-4 py-2 font-medium">Last activity</th>
              <th className="px-4 py-2 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      size="sm"
                      src={user.image}
                      initials={user.name.charAt(0) || user.email.charAt(0)}
                      alt={user.name}
                    />
                    <div>
                      <p className="font-medium text-fg">{user.name}</p>
                      <p className="text-muted-fg">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-fg tabular-nums">
                  {user.receivedCount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-fg tabular-nums">
                  {user.unreadCount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-fg tabular-nums">
                  {user.sentCount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-muted-fg">
                  {formatDate(getLastActivity(user))}
                </td>
                <td className="px-4 py-3 text-muted-fg">
                  {formatDate(user.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RecentActivity({ emails }: { emails: RecentEmail[] }) {
  return (
    <section className="rounded-lg border border-border bg-secondary/40">
      <div className="border-border border-b px-4 py-3">
        <h2 className="font-medium text-fg text-sm">Recent activity</h2>
      </div>
      <div className="divide-y divide-border">
        {emails.length === 0 ? (
          <p className="px-4 py-4 text-muted-fg text-sm">No messages yet</p>
        ) : (
          emails.map((email) => (
            <div key={email.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p
                    className={`truncate text-sm ${
                      email.opened ? "text-muted-fg" : "font-medium text-fg"
                    }`}
                  >
                    {email.subject || "No subject"}
                  </p>
                  <p className="truncate text-muted-fg text-sm">
                    {email.from} · {email.recipient}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <Badge intent="outline" isCircle={false}>
                    {email.category}
                  </Badge>
                  <p className="mt-1 text-muted-fg text-sm">
                    {formatDate(email.receivedAt)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-4">
        {loadingMetricIds.map((id) => (
          <Skeleton key={id} className="h-28" soft />
        ))}
      </div>
      <Skeleton className="h-80" soft />
    </div>
  );
}

function ErrorState({ status }: { status?: number }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-4">
      <h2 className="font-medium text-fg text-sm">
        {status === 403 ? "Admin access required" : "Unable to load dashboard"}
      </h2>
      <p className="mt-1 text-muted-fg text-sm">
        {status === 403
          ? "Add your email to ADMIN_EMAILS and redeploy."
          : "Check the server logs and try again."}
      </p>
    </div>
  );
}

export default function AdminPage() {
  const { data, error, isLoading, mutate } = useSWR<AdminOverviewResponse>(
    "/api/admin/overview",
    fetcher,
  );
  const fetchError = error as FetchError | undefined;

  return (
    <AuthLayout>
      <Head>
        <title>Admin · hosenur.email</title>
      </Head>
      <main className="min-h-screen bg-bg p-4 sm:p-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="size-5 text-muted-fg" />
                <h1 className="font-semibold text-2xl text-fg">Admin</h1>
              </div>
              <p className="mt-1 text-muted-fg text-sm">
                Workspace overview and deployment status
              </p>
            </div>
            <Button
              intent="secondary"
              size="sm"
              onPress={() => void mutate()}
              isDisabled={isLoading}
            >
              Refresh
            </Button>
          </header>

          {isLoading ? (
            <LoadingState />
          ) : error || !data ? (
            <ErrorState status={fetchError?.status} />
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-4">
                <MetricTile
                  label="Users"
                  value={data.metrics.users}
                  detail="accounts"
                  icon={UserIcon}
                />
                <MetricTile
                  label="Received"
                  value={data.metrics.totalEmails}
                  detail="messages"
                  icon={InboxIcon}
                />
                <MetricTile
                  label="Unread"
                  value={data.metrics.unreadEmails}
                  detail="messages"
                  icon={ShieldCheckIcon}
                />
                <MetricTile
                  label="Sent"
                  value={data.metrics.sentEmails}
                  detail="messages"
                  icon={PaperAirplaneIcon}
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
                <UsersTable users={data.users} />
                <div className="space-y-4">
                  <ProviderPanel config={data.providerConfig} />
                  <CategoryPanel
                    categories={data.categoryBreakdown}
                    totalEmails={data.metrics.totalEmails}
                  />
                </div>
              </div>

              <RecentActivity emails={data.recentEmails} />
            </>
          )}
        </div>
      </main>
    </AuthLayout>
  );
}
