"use client";

import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { createFileRoute } from "@tanstack/react-router";
import useSWR, { mutate } from "swr";
import UfoIcon from "@/components/icons/ufo";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Heading } from "@/components/ui/heading";
import { Loader } from "@/components/ui/loader";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { useSelectedEmailId } from "@/hooks/use-selected-email-id";
import { DashboardLayout } from "@/layout/dashboard-layout";

export const Route = createFileRoute("/sent")({
  validateSearch: (search): { id?: string } => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  component: SentPage,
});

interface SentEmail {
  id: string;
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string | null;
  textBody: string | null;
  htmlBody: string | null;
  receivedAt: string;
  opened: boolean;
}

interface SentEmailResponse {
  email: SentEmail;
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

function extractRecipientName(email: string): string {
  const match = email.match(/^(.+?)\s*<.+>$/);
  if (match) {
    return match[1].trim();
  }
  return email.split("@")[0];
}

function extractRecipientEmail(email: string): string {
  const match = email.match(/<(.+?)>$/);
  if (match) {
    return match[1];
  }
  return email;
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

function SentEmailViewer({ emailId }: { emailId: string }) {
  const [, setSelectedId] = useSelectedEmailId();
  const { data, error, isLoading } = useSWR<SentEmailResponse>(
    `/api/emails/${emailId}`,
    fetcher,
    {
      onSuccess: () => {
        mutate("/api/sent");
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
          Back to sent
        </Button>
      </div>
    );
  }

  const email = data.email;
  const primaryRecipient = email.to[0] ?? "";
  const primaryRecipientName = primaryRecipient
    ? extractRecipientName(primaryRecipient)
    : "Recipient";

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
              alt={primaryRecipientName}
              initials={getInitials(primaryRecipientName)}
              isSquare
              size="lg"
            />
            <div className="min-w-0">
              <div className="font-medium text-fg">To</div>
              <div className="space-y-0.5 text-muted-fg text-sm">
                {email.to.map((recipient) => (
                  <div className="truncate" key={recipient}>
                    {extractRecipientName(recipient)} &lt;
                    {extractRecipientEmail(recipient)}&gt;
                  </div>
                ))}
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

        <div className="flex flex-wrap justify-between gap-3">
          <ButtonGroup>
            <ToolbarButton label="Delete" isDisabled>
              <TrashIcon />
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

      <div>
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

function SentEmpty() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-bg">
      <div className="w-full max-w-md space-y-6 p-8">
        <div className="rounded-lg p-6">
          <div className="flex items-center gap-2">
            <UfoIcon className="h-4 w-4 text-muted-fg" />
            <p className="text-muted-fg">No sent emails yet</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SentPage() {
  const [selectedId] = useSelectedEmailId();

  return (
    <DashboardLayout>
      <div className="min-h-full bg-bg">
        {selectedId ? <SentEmailViewer emailId={selectedId} /> : <SentEmpty />}
      </div>
    </DashboardLayout>
  );
}
