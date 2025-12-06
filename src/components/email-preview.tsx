interface Email {
  id: string;
  from: string;
  subject: string | null;
  receivedAt: string;
  category: string | null;
  summary: string | null;
  opened: boolean;
}

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

interface EmailPreviewProps {
  email: Email;
  selectedId: string | null;
}

export function EmailPreview({ email, selectedId }: EmailPreviewProps) {
  return (
    <div className="flex max-w-full flex-col gap-0.5 overflow-hidden py-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!email.opened && (
            <span className="size-1.5 shrink-0 rounded-full bg-primary" />
          )}
          <span className="truncate text-sm font-semibold text-fg">
            {email.subject || "No subject"}
          </span>
        </div>
        <span className="shrink-0 text-xs text-muted-fg">
          {formatTime(email.receivedAt)}
        </span>
      </div>
      <span className="truncate text-sm font-medium text-muted-fg">
        {email.from}
      </span>
      <span className="truncate text-xs text-muted-fg">
        {email.summary || "No preview available"}
      </span>
    </div>
  );
}
