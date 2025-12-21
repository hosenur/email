"use client";

import { useQueryState } from "nuqs";
import useSWR from "swr";
import { EmailPreview } from "@/components/email-preview";
import { Skeleton } from "@/components/ui/skeleton";
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
  opened: boolean;
}

interface EmailsResponse {
  emails: Email[];
}

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => res.json());

export default function EmailSidebar(
  props: React.ComponentProps<typeof Sidebar>,
) {
  const [selectedId, setSelectedId] = useQueryState("id");
  const { data, error, isLoading } = useSWR<EmailsResponse>(
    "/api/emails",
    fetcher,
    {
      refreshInterval: 10000,
    },
  );

  function handleEmailClick(emailId: string) {
    setSelectedId(emailId);
  }

  return (
    <Sidebar
      {...props}
      style={{ "--sidebar-width": "20rem" } as React.CSSProperties}
    >
      <SidebarContent>
        <SidebarSectionGroup>
          <SidebarSection>
            {isLoading && (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <SidebarItem
                    key={`skeleton-${i}`}
                    className="pointer-events-none"
                  >
                    <div className="flex max-w-full flex-col gap-0.5 overflow-hidden py-1">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </SidebarItem>
                ))}
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
                className="hover:bg-transparent hover:text-sidebar-fg data-hovered:bg-transparent data-hovered:text-sidebar-fg [&_[data-slot='icon']]:hover:text-muted-fg [&_[data-slot='icon']]:data-hovered:text-muted-fg"
              >
                <div className="flex max-w-full flex-col gap-0.5 overflow-hidden py-1">
                  <EmailPreview email={email} selectedId={selectedId} />
                </div>
              </SidebarItem>
            ))}
          </SidebarSection>
        </SidebarSectionGroup>
      </SidebarContent>
    </Sidebar>
  );
}
