"use client";

import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import {
  ArchiveBoxIcon,
  ArrowRightStartOnRectangleIcon,
  Cog6ToothIcon,
  InboxIcon,
  PaperAirplaneIcon,
  StarIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
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

  async function handleSignOut() {
    await signOut();
    window.location.href = "/auth";
  }

  return (
    <Sidebar {...props}>
      <SidebarContent>
        <SidebarSectionGroup>
          <SidebarSection>
            <SidebarItem tooltip="Inbox" isCurrent href="#" badge="3">
              <InboxIcon />
              <SidebarLabel>Inbox</SidebarLabel>
            </SidebarItem>
            <SidebarItem tooltip="Starred" href="#">
              <StarIcon />
              <SidebarLabel>Starred</SidebarLabel>
            </SidebarItem>
            <SidebarItem tooltip="Sent" href="#">
              <PaperAirplaneIcon />
              <SidebarLabel>Sent</SidebarLabel>
            </SidebarItem>
            <SidebarItem tooltip="Archive" href="#">
              <ArchiveBoxIcon />
              <SidebarLabel>Archive</SidebarLabel>
            </SidebarItem>
            <SidebarItem tooltip="Trash" href="#">
              <TrashIcon />
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
                initials={session?.user?.name?.charAt(0) || "U"}
              />
              <div className="in-data-[collapsible=dock]:hidden text-sm">
                <SidebarLabel>{session?.user?.name || "User"}</SidebarLabel>
                <span className="-mt-0.5 block text-muted-fg">
                  {session?.user?.email || "user@hosenur.email"}
                </span>
              </div>
            </div>
            <ChevronUpDownIcon data-slot="chevron" />
          </MenuTrigger>
          <MenuContent
            className="in-data-[sidebar-collapsible=collapsed]:min-w-56 min-w-(--trigger-width)"
            placement="bottom right"
          >
            <MenuSection>
              <MenuHeader separator>
                <span className="block">{session?.user?.name || "User"}</span>
                <span className="font-normal text-muted-fg">
                  {session?.user?.email || "user@hosenur.email"}
                </span>
              </MenuHeader>
            </MenuSection>

            <MenuItem href="#settings">
              <Cog6ToothIcon />
              Settings
            </MenuItem>
            <MenuSeparator />
            <MenuItem onAction={handleSignOut}>
              <ArrowRightStartOnRectangleIcon />
              Sign out
            </MenuItem>
          </MenuContent>
        </Menu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
