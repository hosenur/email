"use client";

import { useQueryState } from "nuqs";
import { useState } from "react";
import useSWR from "swr";
import SignOutIcon from "@/components/icons/signout";
import UserIcon from "@/components/icons/usericon";
import {
  CommandMenu,
  CommandMenuItem,
  CommandMenuLabel,
  CommandMenuList,
  CommandMenuSearch,
  CommandMenuSection,
  CommandMenuSeparator,
} from "@/components/ui/command-menu";
import { getAccountUrl, useAccounts } from "@/hooks/use-accounts";
import { signOut, useSession } from "@/lib/auth-client";

interface SearchEmail {
  id: string;
  from: string;
  subject: string | null;
  receivedAt: string;
  category: string | null;
}

interface SearchResponse {
  emails: SearchEmail[];
}

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    throw new Error("Failed to fetch");
  }
  return res.json();
};

function extractSenderName(from: string): string {
  const match = from.match(/^(.+?)\s*<.+>$/);
  if (match) {
    return match[1].trim();
  }
  return from.split("@")[0];
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return "Today";
  } else if (days === 1) {
    return "Yesterday";
  } else if (days < 7) {
    return `${days} days ago`;
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
}

interface CmdProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Cmd({ isOpen, onOpenChange }: CmdProps) {
  const [, setSelectedId] = useQueryState("id");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: session } = useSession();
  const { getOtherAccounts } = useAccounts();

  const { data: searchData, isLoading } = useSWR<SearchResponse>(
    searchQuery ? `/api/search?q=${encodeURIComponent(searchQuery)}` : null,
    fetcher,
  );

  function handleEmailSelect(emailId: string) {
    setSelectedId(emailId);
    onOpenChange(false);
    setSearchQuery("");
  }

  async function handleSignOut() {
    await signOut();
    window.location.href = "/auth";
  }

  function handleSwitchAccount(email: string) {
    window.location.href = getAccountUrl(email);
  }

  const searchResults = searchData?.emails ?? [];
  const currentEmail = session?.user?.email || "";
  const otherAccounts = getOtherAccounts(currentEmail);

  return (
    <CommandMenu
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      shortcut="k"
      isPending={isLoading}
      inputValue={searchQuery}
      onInputChange={setSearchQuery}
    >
      <CommandMenuSearch placeholder="Search emails..." />
      <CommandMenuList>
        {searchResults.length > 0 && (
          <CommandMenuSection label="Results">
            {searchResults.map((email) => (
              <CommandMenuItem
                key={email.id}
                textValue={email.subject || "No subject"}
                onAction={() => handleEmailSelect(email.id)}
              >
                <div className="flex w-full flex-col gap-0.5">
                  <CommandMenuLabel>
                    {email.subject || "No subject"}
                  </CommandMenuLabel>
                  <div className="flex items-center justify-between text-xs text-muted-fg">
                    <span>{extractSenderName(email.from)}</span>
                    <span>{formatRelativeDate(email.receivedAt)}</span>
                  </div>
                </div>
              </CommandMenuItem>
            ))}
          </CommandMenuSection>
        )}
        {searchQuery && !isLoading && searchResults.length === 0 && (
          <CommandMenuSection label="Results">
            <div className="col-span-full p-4 text-center text-muted-fg text-sm">
              No emails found
            </div>
          </CommandMenuSection>
        )}
        {otherAccounts.length > 0 && (
          <>
            <CommandMenuSeparator />
            <CommandMenuSection label="Switch Account">
              {otherAccounts.map((account) => (
                <CommandMenuItem
                  key={account.email}
                  textValue={account.email}
                  onAction={() => handleSwitchAccount(account.email)}
                  className="gap-3"
                >
                  <UserIcon className="size-4" />
                  <CommandMenuLabel>{account.email}</CommandMenuLabel>
                </CommandMenuItem>
              ))}
            </CommandMenuSection>
          </>
        )}
        <CommandMenuSeparator />
        <CommandMenuSection label="Actions">
          <CommandMenuItem
            textValue="Sign out"
            onAction={handleSignOut}
            className="gap-3"
          >
            <SignOutIcon className="size-4" />
            <CommandMenuLabel>Sign out</CommandMenuLabel>
          </CommandMenuItem>
        </CommandMenuSection>
      </CommandMenuList>
    </CommandMenu>
  );
}
