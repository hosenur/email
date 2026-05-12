"use client";

import { useRouter } from "next/router";
import { useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { twMerge } from "tailwind-merge";
import { EmailPreview } from "@/components/email-preview";
import { MagnifyingGlassIcon, UfoIcon } from "@/components/icons/lucide";
import { Skeleton } from "@/components/ui/skeleton";

interface Email {
  id: string;
  from: string;
  subject: string | null;
  receivedAt: string;
  sentAt?: string;
  category: string | null;
  summary: string | null;
  opened: boolean;
  to?: string[];
}

interface EmailsResponse {
  emails: Email[];
}

interface EmailSidebarProps extends React.ComponentProps<"aside"> {
  folder?: "inbox" | "sent";
}

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => res.json());

function normalizeForPreview(email: Email): Email {
  if (!email.sentAt) {
    return email;
  }

  return {
    ...email,
    from: email.to?.join(", ") || email.from,
    receivedAt: email.sentAt,
  };
}

export default function EmailSidebar({
  className,
  folder: folderProp,
  ...props
}: EmailSidebarProps) {
  const [selectedId, setSelectedId] = useQueryState("id");
  const [query, setQuery] = useState("");
  const router = useRouter();

  const isOnSentPage = router.pathname.includes("/sent");
  const folder = folderProp || (isOnSentPage ? "sent" : "inbox");
  const apiUrl = folder === "sent" ? "/api/sent" : "/api/emails";

  const { data, error, isLoading } = useSWR<EmailsResponse>(apiUrl, fetcher, {
    refreshInterval: 10000,
  });

  const filteredEmails = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const emails = data?.emails ?? [];

    if (!normalizedQuery) {
      return emails;
    }

    return emails.filter((email) =>
      [email.subject, email.from, email.summary, email.to?.join(" ")]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalizedQuery)),
    );
  }, [data?.emails, query]);

  return (
    <aside
      className={twMerge(
        "flex h-full min-h-0 flex-col overflow-hidden bg-bg",
        className,
      )}
      {...props}
    >
      <div className="sticky top-0 z-10 border-b bg-muted/50 px-3 py-2 focus-within:bg-muted/70">
        <div className="relative">
          <MagnifyingGlassIcon className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-2 size-4 text-muted-fg" />
          <input
            type="search"
            aria-label="Search messages"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search messages"
            className="h-9 w-full rounded-md border-0 bg-transparent pr-2 pl-8 text-fg text-sm outline-hidden placeholder:text-muted-fg focus:ring-0"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton
                key={`email-skeleton-${index.toString()}`}
                className="h-16 w-full"
              />
            ))}
          </div>
        ) : error ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-muted-fg text-sm">Failed to load emails</p>
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-2">
            <UfoIcon className="h-6 w-6 text-muted-fg" />
            <p className="text-muted-fg text-sm">
              {folder === "sent" ? "No sent emails" : "No emails"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredEmails.map((email) => {
              const isSelected = selectedId === email.id;

              return (
                <button
                  type="button"
                  key={email.id}
                  className={twMerge(
                    "block w-full px-3 py-2 text-left outline-hidden hover:bg-secondary/50 focus-visible:bg-secondary/50 focus-visible:ring-2 focus-visible:ring-ring/40",
                    isSelected && "bg-secondary/70",
                  )}
                  onClick={() => {
                    void setSelectedId(email.id);
                  }}
                >
                  <EmailPreview
                    email={normalizeForPreview(email)}
                    selectedId={selectedId}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
