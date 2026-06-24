"use client";

import { useLocation } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import useSWR from "swr";
import UfoIcon from "@/components/icons/ufo";
import {
  GridList,
  GridListDescription,
  GridListItem,
} from "@/components/ui/grid-list";
import { SearchField, SearchInput } from "@/components/ui/search-field";
import { Skeleton } from "@/components/ui/skeleton";
import { useSelectedEmailId } from "@/hooks/use-selected-email-id";

interface Email {
  id: string;
  from: string;
  subject: string | null;
  receivedAt?: string;
  sentAt?: string;
  category: string | null;
  summary: string | null;
  opened: boolean;
  to?: string[];
}

interface EmailsResponse {
  emails: Email[];
}

interface EmailSidebarProps {
  folder?: "inbox" | "sent";
}

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    throw new Error("Failed to fetch emails");
  }
  return res.json();
};

function formatTime(dateString?: string | null): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

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

function extractName(email: string): string {
  const match = email.match(/^(.+?)\s*<.+>$/);
  if (match) {
    return match[1].trim();
  }
  return email.split("@")[0];
}

function getDisplayName(email: Email, folder: "inbox" | "sent"): string {
  if (folder === "sent") {
    const recipients = email.to?.map(extractName).filter(Boolean) ?? [];
    return recipients.length > 0 ? `To: ${recipients.join(", ")}` : "Sent";
  }

  return extractName(email.from);
}

function getEmailDate(email: Email): string | undefined {
  return email.sentAt ?? email.receivedAt;
}

export default function EmailSidebar(props: EmailSidebarProps) {
  const [selectedId, setSelectedId] = useSelectedEmailId();
  const location = useLocation();
  const [search, setSearch] = useState("");

  const isOnSentPage = location.pathname.includes("/sent");
  const folder = props.folder || (isOnSentPage ? "sent" : "inbox");
  const apiUrl = folder === "sent" ? "/api/sent" : "/api/emails";

  const { data, error, isLoading } = useSWR<EmailsResponse>(apiUrl, fetcher, {
    refreshInterval: 10000,
  });

  const emails = data?.emails ?? [];
  const filteredEmails = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return emails;
    }

    return emails.filter((email) => {
      const searchable = [
        getDisplayName(email, folder),
        email.from,
        email.to?.join(", "),
        email.subject,
        email.summary,
        email.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [emails, folder, search]);

  function handleSelectionChange(keys: "all" | Set<React.Key>) {
    if (keys === "all") return;

    const [key] = Array.from(keys);
    setSelectedId(key ? String(key) : null);
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-bg">
      <div className="sticky top-0 z-10 border-b bg-muted/50 py-1 focus-within:bg-muted/70">
        <SearchField
          aria-label="Search messages"
          value={search}
          onChange={setSearch}
        >
          <SearchInput
            id="mail-search"
            className="border-none focus:ring-0"
            placeholder="Search messages"
          />
        </SearchField>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={`skeleton-${i.toString()}`} className="h-16" />
            ))}
          </div>
        ) : error ? (
          <div className="flex h-32 items-center justify-center px-6 text-center">
            <p className="text-sm text-muted-fg">Failed to load emails</p>
          </div>
        ) : emails.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-2">
            <UfoIcon className="h-6 w-6 text-muted-fg" />
            <p className="text-sm text-muted-fg">
              {folder === "sent" ? "No sent emails" : "No emails"}
            </p>
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="flex h-32 items-center justify-center px-6 text-center">
            <p className="text-sm text-muted-fg">No matching messages</p>
          </div>
        ) : (
          <GridList
            aria-label={folder === "sent" ? "Sent emails" : "Inbox emails"}
            className="rounded-none border-none bg-transparent p-2 dark:bg-transparent"
            items={filteredEmails}
            onSelectionChange={handleSelectionChange}
            selectedKeys={selectedId ? [selectedId] : []}
            selectionMode="single"
          >
            {(email) => (
              <GridListItem
                id={email.id}
                key={email.id}
                textValue={getDisplayName(email, folder)}
                className="inset-ring-transparent px-3 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      {folder === "inbox" && !email.opened && (
                        <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                      )}
                      <strong className="truncate font-medium text-fg text-sm">
                        {getDisplayName(email, folder)}
                      </strong>
                    </div>
                    <GridListDescription className="shrink-0 text-xs">
                      {formatTime(getEmailDate(email))}
                    </GridListDescription>
                  </div>
                  <GridListDescription className="mt-1 max-w-full truncate text-sm">
                    {email.subject || "No subject"}
                  </GridListDescription>
                  {email.summary && (
                    <GridListDescription className="mt-0.5 max-w-full truncate text-xs">
                      {email.summary}
                    </GridListDescription>
                  )}
                </div>
              </GridListItem>
            )}
          </GridList>
        )}
      </div>
    </div>
  );
}
