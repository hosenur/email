"use client";

import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";
import { useQueryState } from "nuqs";
import useSWR from "swr";
import SparkleIcon from "@/components/icons/sparkle";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { DashboardLayout } from "@/layout/dashboard-layout";
import { useSession } from "@/lib/auth-client";

interface Email {
  id: string;
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string | null;
  textBody: string | null;
  htmlBody: string | null;
  receivedAt: string;
  category: string | null;
  summary: string | null;
  actionItems: string[];
}

interface EmailResponse {
  email: Email;
}

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    throw new Error("Failed to fetch");
  }
  return res.json();
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function extractSenderName(from: string): string {
  const match = from.match(/^(.+?)\s*<.+>$/);
  if (match) {
    return match[1].trim();
  }
  return from.split("@")[0];
}

function extractSenderEmail(from: string): string {
  const match = from.match(/<(.+?)>$/);
  if (match) {
    return match[1];
  }
  return from;
}

function EmailViewer({ emailId }: { emailId: string }) {
  const [, setSelectedId] = useQueryState("id");
  const { data, error, isLoading } = useSWR<EmailResponse>(
    `/api/emails/${emailId}`,
    fetcher,
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error || !data?.email) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-muted-fg">Failed to load email</p>
        <Button intent="secondary" onPress={() => setSelectedId(null)}>
          <ArrowLeftIcon className="size-4" />
          Back to inbox
        </Button>
      </div>
    );
  }

  const email = data.email;

  return (
    <div className="flex h-full flex-col">
      {/* Email Header */}
      <div className="border-b border-border p-6">
        <h1 className="mb-4 text-2xl font-semibold text-fg">
          {email.subject || "No subject"}
        </h1>

        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-fg">
                {extractSenderName(email.from)}
              </span>
              <span className="text-sm text-muted-fg">
                &lt;{extractSenderEmail(email.from)}&gt;
              </span>
            </div>
            <div className="text-sm text-muted-fg">
              To: {email.to.join(", ")}
            </div>
            {email.cc.length > 0 && (
              <div className="text-sm text-muted-fg">
                Cc: {email.cc.join(", ")}
              </div>
            )}
          </div>
          <div className="text-sm text-muted-fg">
            {formatDate(email.receivedAt)}
          </div>
        </div>

        {email.category && (
          <div className="mt-3">
            <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium text-fg">
              {email.category}
            </span>
          </div>
        )}
      </div>

      {/* Email Body */}
      <div className="flex-1 overflow-auto p-6">
        {email.summary && (
          <div className="mb-6 rounded-lg">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-fg">
              <SparkleIcon className="w-4 h-4" />
              AI Summary
            </h3>
            <p className="text-sm text-muted-fg">{email.summary}</p>
          </div>
        )}

        {email.actionItems && email.actionItems.length > 0 && (
          <div className="mb-6 rounded-lg bg-secondary/50 p-4">
            <h3 className="mb-2 text-sm font-medium text-fg">Action Items</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-fg">
              {email.actionItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {email.htmlBody ? (
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: email.htmlBody }}
          />
        ) : email.textBody ? (
          <pre className="whitespace-pre-wrap font-sans text-sm text-fg">
            {email.textBody}
          </pre>
        ) : (
          <p className="text-muted-fg">No content</p>
        )}
      </div>
    </div>
  );
}

interface TldrResponse {
  tldr: string | null;
  count: number;
  message?: string;
}

function InboxEmpty() {
  const { data: session } = useSession();
  const router = useRouter();
  const { subdomain } = router.query;
  const {
    data: tldrData,
    error: tldrError,
    isLoading: tldrLoading,
  } = useSWR<TldrResponse>("/api/tldr", fetcher);

  return (
    <div className="flex h-full flex-col items-center justify-center bg-bg">
      <div className="w-full max-w-md space-y-6 p-8 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-fg">
            Welcome to your inbox
          </h1>
          <p className="text-sm text-muted-fg">
            You are signed in as{" "}
            {session?.user?.email || `${subdomain}@hosenur.email`}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-secondary/50 p-6">
          {tldrLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader />
            </div>
          ) : tldrError ? (
            <p className="text-muted-fg">
              Select an email from the sidebar to view it here
            </p>
          ) : tldrData?.tldr ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <SparkleIcon className="h-4 w-4 text-muted-fg" />
                <span className="text-sm font-medium text-fg">
                  TLDR ({tldrData.count} unread)
                </span>
              </div>
              <p className="text-sm text-muted-fg">{tldrData.tldr}</p>
            </div>
          ) : tldrData?.count === 0 ? (
            <p className="text-muted-fg">
              No unread emails. You're all caught up!
            </p>
          ) : (
            <p className="text-muted-fg">
              Select an email from the sidebar to view it here
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SubdomainPage() {
  const [selectedId] = useQueryState("id");

  return (
    <DashboardLayout>
      <div className="h-screen bg-bg">
        {selectedId ? <EmailViewer emailId={selectedId} /> : <InboxEmpty />}
      </div>
    </DashboardLayout>
  );
}
