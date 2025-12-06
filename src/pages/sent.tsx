"use client";

import { useQueryState } from "nuqs";
import useSWR from "swr";
import SentIcon from "@/components/icons/sent";
import { Loader } from "@/components/ui/loader";
import { DashboardLayout } from "@/layout/dashboard-layout";

interface SentEmail {
  id: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string | null;
  textBody: string | null;
  htmlBody: string | null;
  sentAt: string;
  opened: boolean;
}

interface SentEmailsResponse {
  emails: SentEmail[];
}

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => res.json());

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
  if (days === 1) {
    return "Yesterday";
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function extractRecipientName(email: string): string {
  const match = email.match(/^(.+?)\s*<.+>$/);
  if (match) {
    return match[1].trim();
  }
  return email.split("@")[0];
}

export default function SentPage() {
  const { data, error, isLoading } = useSWR<SentEmailsResponse>(
    "/api/sent",
    fetcher,
    {
      refreshInterval: 10000,
    },
  );

  function handleEmailClick(emailId: string) {
    // TODO: Navigate to email detail view
  }

  return (
    <DashboardLayout>
      <div className="h-screen bg-bg">
        <div className="flex h-full flex-col items-center justify-center bg-bg">
          <div className="w-full max-w-md space-y-6 p-8">
            <div className="rounded-lg p-6">
              <div className="flex items-center justify-center py-8">
                <SentIcon className="h-8 w-8 text-muted-fg" />
              </div>
              <h2 className="mb-4 text-center text-lg font-medium text-fg">
                Sent Emails
              </h2>
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader />
                </div>
              ) : error ? (
                <div className="text-center text-sm text-muted-fg">
                  Failed to load sent emails
                </div>
              ) : data?.emails && data.emails.length === 0 ? (
                <p className="text-center text-muted-fg">No sent emails yet</p>
              ) : (
                <div className="space-y-3">
                  {data?.emails?.map((email) => (
                    <div
                      key={email.id}
                      className="cursor-pointer rounded-lg border border-border p-4 hover:bg-secondary/50"
                      onClick={() => handleEmailClick(email.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {!email.opened && (
                            <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                          )}
                          <span className="font-medium text-fg">
                            To: {email.to.map(extractRecipientName).join(", ")}
                          </span>
                        </div>
                        <span className="shrink-0 text-xs text-muted-fg">
                          {formatTime(email.sentAt)}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-muted-fg">
                        {email.subject || "No subject"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
