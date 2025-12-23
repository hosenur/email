"use client";

import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useQueryState } from "nuqs";
import useSWR, { mutate } from "swr";
import UfoIcon from "@/components/icons/ufo";
import { Button } from "@/components/ui/button";
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

function SentEmailViewer({ emailId }: { emailId: string }) {
  const [, setSelectedId] = useQueryState("id");
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

  return (
    <div className="flex h-full flex-col">
      <div className="p-6">
        <h1 className="mb-4 text-2xl font-semibold text-fg">
          {email.subject || "No subject"}
        </h1>

        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-fg">To:</span>
              <span className="text-sm text-muted-fg">
                {email.to.map((recipient) => (
                  <span key={recipient}>
                    {extractRecipientName(recipient)} &lt;
                    {extractRecipientEmail(recipient)}&gt;
                  </span>
                ))}
              </span>
            </div>
            {email.cc.length > 0 && (
              <div className="text-sm text-muted-fg">
                Cc: {email.cc.join(", ")}
              </div>
            )}
          </div>
          <div className="text-sm text-muted-fg">
            {formatDate(email.sentAt)}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
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

export default function SubdomainSentPage() {
  const [selectedId] = useQueryState("id");

  return (
    <DashboardLayout>
      <div className="min-h-full bg-bg">
        {selectedId ? <SentEmailViewer emailId={selectedId} /> : <SentEmpty />}
      </div>
    </DashboardLayout>
  );
}
