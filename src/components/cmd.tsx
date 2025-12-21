"use client";

import { useQueryState } from "nuqs";
import { useState } from "react";
import useSWR from "swr";

import { Avatar } from "@/components/ui/avatar";
import {
  CommandMenu,
  CommandMenuItem,
  CommandMenuLabel,
  CommandMenuList,
  CommandMenuSearch,
  CommandMenuSection,
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

interface UserInfo {
  email: string;
  name: string;
  image: string | null;
}

interface UsersResponse {
  users: UserInfo[];
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

  const currentEmail = session?.user?.email || "";
  const otherAccounts = getOtherAccounts(currentEmail);

  const { data: searchData, isLoading } = useSWR<SearchResponse>(
    searchQuery ? `/api/search?q=${encodeURIComponent(searchQuery)}` : null,
    fetcher,
  );

  const { data: usersData } = useSWR<UsersResponse>(
    otherAccounts.length > 0
      ? `/api/users?emails=${encodeURIComponent(otherAccounts.join(","))}`
      : null,
    fetcher,
  );

  const usersMap = new Map(usersData?.users?.map((u) => [u.email, u]) ?? []);

  function handleEmailSelect(emailId: string) {
    setSelectedId(emailId);
    onOpenChange(false);
    setSearchQuery("");
  }

  async function handleSignOut() {
    await signOut();
    const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    const protocol = ROOT_DOMAIN.includes("localhost") ? "http" : "https";
    window.location.href = `${protocol}://${ROOT_DOMAIN}`;
  }

  function handleSwitchAccount(email: string) {
    const targetUser = usersMap.get(email);
    const fromImage = session?.user?.image || "";
    const toImage = targetUser?.image || "";
    const redirectUrl = getAccountUrl(email);

    const searchParams = new URLSearchParams({
      redirect: redirectUrl,
      fromImage,
      toImage,
    });

    window.location.href = `/switch?${searchParams.toString()}`;
  }

  const searchResults = searchData?.emails ?? [];

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
        <CommandMenuSection label="Actions">
          <CommandMenuItem textValue="Sign out" onAction={handleSignOut}>
            <CommandMenuLabel>Sign out</CommandMenuLabel>
          </CommandMenuItem>
        </CommandMenuSection>
        {otherAccounts.length > 0 && (
          <>
            <CommandMenuSection label="Switch Account">
              {otherAccounts.map((email) => {
                const user = usersMap.get(email);
                return (
                  <CommandMenuItem
                    key={email}
                    textValue={email}
                    onAction={() => handleSwitchAccount(email)}
                    className="gap-2"
                  >
                    <Avatar
                      src={user?.image}
                      initials={user?.name?.charAt(0) || email.charAt(0)}
                      size="xs"
                    />
                    <CommandMenuLabel>{email}</CommandMenuLabel>
                  </CommandMenuItem>
                );
              })}
            </CommandMenuSection>
          </>
        )}
      </CommandMenuList>
    </CommandMenu>
  );
}
