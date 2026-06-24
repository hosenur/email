"use client";

import {
  ArchiveBoxIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  FunnelIcon,
  StarIcon,
  TagIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { createFileRoute } from "@tanstack/react-router";
import useSWR, { mutate } from "swr";
import SparkleIcon from "@/components/icons/sparkle";
import UfoIcon from "@/components/icons/ufo";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Heading } from "@/components/ui/heading";
import { Loader } from "@/components/ui/loader";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { useSelectedEmailId } from "@/hooks/use-selected-email-id";
import { DashboardLayout } from "@/layout/dashboard-layout";

export const Route = createFileRoute("/inbox")({
  validateSearch: (search): { id?: string } => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  component: InboxPage,
});

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

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

interface ToolbarButtonProps {
  label: string;
  children: React.ReactNode;
  isDisabled?: boolean;
}

function ToolbarButton({ label, children, isDisabled }: ToolbarButtonProps) {
  return (
    <Tooltip>
      <Button
        aria-label={label}
        intent="secondary"
        isDisabled={isDisabled}
        size="sq-sm"
      >
        {children}
      </Button>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function EmailViewer({ emailId }: { emailId: string }) {
  const [, setSelectedId] = useSelectedEmailId();
  const { data, error, isLoading } = useSWR<EmailResponse>(
    `/api/emails/${emailId}`,
    fetcher,
    {
      onSuccess: () => {
        mutate("/api/emails");
      },
    },
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
  const senderName = extractSenderName(email.from);
  const senderEmail = extractSenderEmail(email.from);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="space-y-5">
        <Button
          className="sm:hidden"
          intent="secondary"
          onPress={() => setSelectedId(null)}
          size="sm"
        >
          <ArrowLeftIcon className="size-4" />
          Back
        </Button>

        <Heading level={2}>{email.subject || "No subject"}</Heading>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-x-3">
            <Avatar
              alt={senderName}
              initials={getInitials(senderName)}
              isSquare
              size="lg"
            />
            <div className="min-w-0">
              <div className="truncate font-medium text-fg">{senderName}</div>
              <div className="truncate text-muted-fg text-sm">
                {senderEmail}
              </div>
              <div className="truncate text-muted-fg text-sm">
                To: {email.to.join(", ")}
              </div>
              {email.cc.length > 0 && (
                <div className="truncate text-muted-fg text-sm">
                  Cc: {email.cc.join(", ")}
                </div>
              )}
            </div>
          </div>
          <div className="shrink-0 text-muted-fg text-sm">
            {formatDate(email.receivedAt)}
          </div>
        </div>

        {email.category && (
          <div>
            <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium text-fg">
              {email.category}
            </span>
          </div>
        )}

        <div className="flex flex-wrap justify-between gap-3">
          <ButtonGroup className="flex-wrap">
            <ToolbarButton label="Move to favorite" isDisabled>
              <StarIcon />
            </ToolbarButton>
            <ToolbarButton label="Delete" isDisabled>
              <TrashIcon />
            </ToolbarButton>
            <ToolbarButton label="Mark as" isDisabled>
              <TagIcon />
            </ToolbarButton>
            <ToolbarButton label="Filter" isDisabled>
              <FunnelIcon />
            </ToolbarButton>
            <ToolbarButton label="Archive" isDisabled>
              <ArchiveBoxIcon />
            </ToolbarButton>
          </ButtonGroup>

          <ButtonGroup>
            <ToolbarButton label="Reply" isDisabled>
              <ArrowUturnLeftIcon />
            </ToolbarButton>
            <ToolbarButton label="Forward" isDisabled>
              <ArrowUturnRightIcon />
            </ToolbarButton>
          </ButtonGroup>
        </div>
      </div>

      <div className="space-y-6">
        {email.summary && (
          <div className="rounded-lg border border-border bg-muted/40 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-fg">
              <SparkleIcon className="h-4 w-4" />
              AI Summary
            </h3>
            <p className="text-sm text-muted-fg">{email.summary}</p>
          </div>
        )}

        {email.actionItems && email.actionItems.length > 0 && (
          <div className="rounded-lg border border-border bg-muted/40 p-4">
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
            // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML email content rendering is required
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
  const { data: tldrData } = useSWR<TldrResponse>("/api/tldr", fetcher);

  return (
    <div className="flex h-full flex-col items-center justify-center bg-bg">
      <div className="w-full max-w-md space-y-6 p-8">
        <div className="rounded-lg p-6">
          {tldrData?.tldr ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <SparkleIcon className="h-4 w-4 text-muted-fg" />
                <span className="text-sm font-medium text-fg">
                  TLDR ({tldrData.count} unread)
                </span>
              </div>
              <p className="text-sm text-muted-fg">{tldrData.tldr}</p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <UfoIcon className="h-4 w-4 text-muted-fg" />
              <p className="text-muted-fg">nothing to see here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InboxPage() {
  const [selectedId] = useSelectedEmailId();

  return (
    <DashboardLayout>
      <div className="min-h-full bg-bg">
        {selectedId ? <EmailViewer emailId={selectedId} /> : <InboxEmpty />}
      </div>
    </DashboardLayout>
  );
}
