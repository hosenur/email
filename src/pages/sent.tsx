"use client";

import { useQueryState } from "nuqs";
import useSWR from "swr";
import { Loader } from "@/components/ui/loader";
import { DashboardLayout } from "@/layout/dashboard-layout";

interface SentEmail {
  id: string;
  from: string;
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
  const [selectedId, setSelectedId] = useQueryState("id");
  const { data, error, isLoading } = useSWR<SentEmailsResponse>(
    "/api/sent",
    fetcher,
    {
      refreshInterval: 10000,
    },
  );

  return (
    <DashboardLayout>
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <Loader />
        </div>
      ) : error ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-muted-fg">Failed to load sent emails</p>
        </div>
      ) : data?.emails && data.emails.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-fg">No sent emails yet</p>
        </div>
      ) : (
        <div className="p-6">
          {data?.emails?.map((email) => (
            <button
              type="button"
              key={email.id}
              className={`w-full cursor-pointer rounded-lg border border-border p-4 text-left hover:bg-secondary/50 ${selectedId === email.id ? "bg-secondary/50" : ""}`}
              onClick={() => setSelectedId(email.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
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
            </button>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
