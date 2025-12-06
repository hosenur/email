"use client";

import { useQueryState } from "nuqs";
import useSWR from "swr";
import { Loader } from "@/components/ui/loader";
import {
  Sidebar,
  SidebarContent,
  SidebarItem,
  SidebarSection,
  SidebarSectionGroup,
} from "@/components/ui/sidebar";

interface Email {
  id: string;
  from: string;
  subject: string | null;
  receivedAt: string;
  category: string | null;
  summary: string | null;
}

interface EmailsResponse {
  emails: Email[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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

function extractSenderName(from: string): string {
  // Handle "Name <email>" format
  const match = from.match(/^(.+?)\s*<.+>$/);
  if (match) {
    return match[1].trim();
  }
  // Handle plain email
  return from.split("@")[0];
}

export default function EmailSidebar(
  props: React.ComponentProps<typeof Sidebar>,
) {
  const [selectedId, setSelectedId] = useQueryState("id");
  const { data, error, isLoading } = useSWR<EmailsResponse>(
    "/api/emails",
    fetcher,
  );

  function handleEmailClick(emailId: string) {
    setSelectedId(emailId);
  }

  return (
    <Sidebar {...props}>
      <SidebarContent>
        <SidebarSectionGroup>
          <SidebarSection>
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader />
              </div>
            )}
            {error && (
              <div className="px-3 py-8 text-center text-sm text-muted-fg">
                Failed to load emails
              </div>
            )}
            {data?.emails && data.emails.length === 0 && (
              <div className="px-3 py-8 text-center text-sm text-muted-fg">
                No emails yet
              </div>
            )}
            {data?.emails?.map((email) => (
              <SidebarItem
                key={email.id}
                tooltip={email.subject || "No subject"}
                isCurrent={selectedId === email.id}
                onPress={() => handleEmailClick(email.id)}
              >
                <div className="flex max-w-full flex-col gap-0.5 overflow-hidden py-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`truncate text-sm ${selectedId === email.id ? "font-semibold text-fg" : "font-medium text-fg"}`}
                    >
                      {extractSenderName(email.from)}
                    </span>
                    <span className="shrink-0 text-xs text-muted-fg">
                      {formatTime(email.receivedAt)}
                    </span>
                  </div>
                  <span
                    className={`truncate text-sm ${selectedId === email.id ? "font-medium text-fg" : "text-muted-fg"}`}
                  >
                    {email.subject || "No subject"}
                  </span>
                  <span className="truncate text-xs text-muted-fg">
                    {email.summary || "No preview available"}
                  </span>
                </div>
              </SidebarItem>
            ))}
          </SidebarSection>
        </SidebarSectionGroup>
      </SidebarContent>
    </Sidebar>
  );
}
