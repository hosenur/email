"use client";

import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { useTheme } from "next-themes";
import ArchiveIcon from "@/components/icons/archive";
import InboxIcon from "@/components/icons/inbox";
import SentIcon from "@/components/icons/sent";
import SettingsIcon from "@/components/icons/settings";
import SignOutIcon from "@/components/icons/signout";
import SparkleIcon from "@/components/icons/sparkle";
import StarIcon from "@/components/icons/star";
import ThemeIcon from "@/components/icons/theme";
import TrashIcon from "@/components/icons/trash";
import { Avatar } from "@/components/ui/avatar";
import {
  Menu,
  MenuContent,
  MenuHeader,
  MenuItem,
  MenuSection,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarItem,
  SidebarLabel,
  SidebarRail,
  SidebarSection,
  SidebarSectionGroup,
} from "@/components/ui/sidebar";
import { signOut, useSession } from "@/lib/auth-client";

export default function AppSidebar(
  props: React.ComponentProps<typeof Sidebar>,
) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  async function handleSignOut() {
    await signOut();
    window.location.href = "/auth";
  }

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return (
    <Sidebar {...props}>
      <SidebarContent>
        <SidebarSectionGroup>
          <SidebarSection>
            <SidebarItem tooltip="Inbox" href="#" badge="3" className="gap-3">
              <InboxIcon className="h-4 w-4" />
              <SidebarLabel>Inbox</SidebarLabel>
            </SidebarItem>
            <SidebarItem tooltip="Starred" href="#" className="gap-3">
              <StarIcon className="h-4 w-4" />
              <SidebarLabel>Starred</SidebarLabel>
            </SidebarItem>
            <SidebarItem tooltip="Sparkle" href="#" className="gap-3">
              <SparkleIcon className="h-4 w-4" />
              <SidebarLabel>Sparkle</SidebarLabel>
            </SidebarItem>
            <SidebarItem tooltip="Sent" href="#" className="gap-3">
              <SentIcon className="h-4 w-4" />
              <SidebarLabel>Sent</SidebarLabel>
            </SidebarItem>
            <SidebarItem tooltip="Archive" href="#" className="gap-3">
              <ArchiveIcon className="h-4 w-4" />
              <SidebarLabel>Archive</SidebarLabel>
            </SidebarItem>
            <SidebarItem tooltip="Trash" href="#" className="gap-3">
              <TrashIcon className="h-4 w-4" />
              <SidebarLabel>Trash</SidebarLabel>
            </SidebarItem>
          </SidebarSection>
        </SidebarSectionGroup>
      </SidebarContent>

      <SidebarFooter className="flex flex-row justify-between gap-4 group-data-[state=collapsed]:flex-col">
        <Menu>
          <MenuTrigger
            className="flex w-full items-center justify-between"
            aria-label="Profile"
          >
            <div className="flex items-center gap-x-2">
              <Avatar
                className="size-8 *:size-8 group-data-[state=collapsed]:size-6 group-data-[state=collapsed]:*:size-6"
                isSquare
                src={session?.user?.image}
                initials={session?.user?.name?.charAt(0) || "U"}
              />
              <div className="in-data-[collapsible=dock]:hidden text-sm">
                <SidebarLabel>{session?.user?.name || "User"}</SidebarLabel>
                <span className="-mt-0.5 block text-muted-fg">
                  {session?.user?.email}
                </span>
              </div>
            </div>
            <ChevronUpDownIcon data-slot="chevron" className="h-4 w-4" />
          </MenuTrigger>
          <MenuContent
            className="in-data-[sidebar-collapsible=collapsed]:min-w-56 min-w-(--trigger-width)"
            placement="bottom right"
          >
            <MenuSection>
              <MenuHeader separator>
                <span className="block">{session?.user?.name || "User"}</span>
                <span className="font-normal text-muted-fg">
                  {session?.user?.email}
                </span>
              </MenuHeader>
            </MenuSection>

            <MenuItem href="#settings" className="gap-3">
              <SettingsIcon className="h-4 w-4" />
              Settings
            </MenuItem>
            <MenuItem onAction={toggleTheme} className="gap-3">
              <ThemeIcon className="h-4 w-4" />
              Toggle theme
            </MenuItem>
            <MenuSeparator />
            <MenuItem onAction={handleSignOut} className="gap-3">
              <SignOutIcon className="h-4 w-4" />
              Sign out
            </MenuItem>
          </MenuContent>
        </Menu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
