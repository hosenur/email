"use client";

import { useRouter } from "next/router";
import { useQueryState } from "nuqs";
import useSWR from "swr";
import { EmailPreview } from "@/components/email-preview";
import UfoIcon from "@/components/icons/ufo";
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
  sentAt?: string;
  category: string | null;
  summary: string | null;
  opened: boolean;
  to?: string[];
}

interface EmailsResponse {
  emails: Email[];
}

interface EmailSidebarProps extends React.ComponentProps<typeof Sidebar> {
  folder?: "inbox" | "sent";
}

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => res.json());

export default function EmailSidebar(props: EmailSidebarProps) {
  const [selectedId, setSelectedId] = useQueryState("id");
  const router = useRouter();

  const isOnSentPage = router.pathname.includes("/sent");
  const folder = props.folder || (isOnSentPage ? "sent" : "inbox");
  const apiUrl = folder === "sent" ? "/api/sent" : "/api/emails";

  const { data, error, isLoading } = useSWR<EmailsResponse>(apiUrl, fetcher, {
    refreshInterval: 10000,
  });

  return (
    <Sidebar {...props}>
      <SidebarContent>
        <SidebarSectionGroup>
          <SidebarSection>
            {isLoading ? (
              <div className="space-y-2 p-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton
                    key={`skeleton-${i.toString()}`}
                    className="h-16 w-full"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="flex h-32 items-center justify-center">
                <p className="text-sm text-muted-fg">Failed to load emails</p>
              </div>
            ) : !data?.emails || data.emails.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center gap-2">
                <UfoIcon className="h-6 w-6 text-muted-fg" />
                <p className="text-sm text-muted-fg">
                  {folder === "sent" ? "No sent emails" : "No emails"}
                </p>
              </div>
            ) : (
              data.emails.map((email) => (
                <SidebarItem
                  key={email.id}
                  isCurrent={selectedId === email.id}
                  onPress={() => setSelectedId(email.id)}
                  className="h-auto py-2"
                >
                  <EmailPreview email={email} selectedId={selectedId} />
                </SidebarItem>
              ))
            )}
          </SidebarSection>
        </SidebarSectionGroup>
      </SidebarContent>
    </Sidebar>
  );
}
