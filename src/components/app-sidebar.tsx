"use client";

import {
  ArchiveBoxIcon,
  ArrowRightStartOnRectangleIcon,
  BookmarkIcon,
  ChartPieIcon,
  ChatBubbleLeftRightIcon,
  ChevronUpDownIcon,
  Cog6ToothIcon,
  InboxIcon,
  PaperAirplaneIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  StarIcon,
  TrashIcon,
} from "@/components/icons/lucide";
import type { ComponentType, SVGProps } from "react";
import { twJoin } from "tailwind-merge";
import { Avatar } from "@/components/ui/avatar";
import {
  Menu,
  MenuContent,
  MenuHeader,
  MenuItem,
  MenuLabel,
  MenuSection,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarRail,
  SidebarSection,
  SidebarSectionGroup,
  useSidebar,
} from "@/components/ui/sidebar";

type MenuItemProps = {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

type MenuSectionProps = {
  section: string;
  items: MenuItemProps[];
};

export const menus: MenuSectionProps[] = [
  {
    section: "Mailbox",
    items: [
      { label: "Inbox", href: "#mail", icon: InboxIcon },
      { label: "Starred", href: "#mail/starred", icon: StarIcon },
      { label: "Sent", href: "#mail/sent", icon: PaperAirplaneIcon },
      { label: "Drafts", href: "#mail/drafts", icon: PencilSquareIcon },
      { label: "Archive", href: "#mail/archive", icon: ArchiveBoxIcon },
      { label: "Trash", href: "#mail/trash", icon: TrashIcon },
    ],
  },
  {
    section: "Organize",
    items: [
      { label: "Bookmarks", href: "#mail/bookmarks", icon: BookmarkIcon },
      { label: "Spam", href: "#mail/spam", icon: ShieldCheckIcon },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  return (
    <Sidebar closeButton={false} collapsible="dock">
      <SidebarHeader>
        <Menu>
          <MenuTrigger
            className="flex w-full items-center justify-between"
            aria-label="Profile"
          >
            <div
              className={twJoin(
                "flex items-center gap-x-2",
                collapsed && "pt-2 pl-1",
              )}
            >
              <Avatar
                className={twJoin(
                  collapsed
                    ? "group-data-[state=collapsed]:[--avatar-size:--spacing(6)]"
                    : "group-data-[state=collapsed]:[--avatar-size:--spacing(8)]",
                )}
                isSquare
                src="https://design.intentui.com/images/blocks/avatar/woman.webp"
              />

              <div className="in-data-[collapsible=dock]:hidden text-sm">
                <SidebarLabel>Poppy Ellsworth</SidebarLabel>
                <span className="-mt-0.5 block text-muted-fg">
                  ellsworth@domain.com
                </span>
              </div>
            </div>
            {!collapsed && (
              <ChevronUpDownIcon
                data-slot="chevron"
                className="size-4 shrink-0"
              />
            )}
          </MenuTrigger>
          <MenuContent
            className="in-data-[collapsible=collapsed]:min-w-56 min-w-(--trigger-width)"
            placement="bottom right"
          >
            <MenuSection>
              <MenuHeader separator>
                <span className="block">Poppy Ellsworth</span>
                <span className="font-normal text-muted-fg">
                  ellsworth@domain.com
                </span>
              </MenuHeader>
            </MenuSection>

            <MenuItem href="#dashboard">
              <ChartPieIcon />
              <MenuLabel>Dashboard</MenuLabel>
            </MenuItem>
            <MenuItem href="#settings">
              <Cog6ToothIcon />
              <MenuLabel>Settings</MenuLabel>
            </MenuItem>
            <MenuItem href="#security">
              <ShieldCheckIcon />
              <MenuLabel>Security</MenuLabel>
            </MenuItem>
            <MenuSeparator />

            <MenuItem href="#contact">
              <ChatBubbleLeftRightIcon />
              <MenuLabel>Customer support</MenuLabel>
            </MenuItem>
            <MenuSeparator />
            <MenuItem href="#logout">
              <ArrowRightStartOnRectangleIcon />
              <MenuLabel>Log out</MenuLabel>
            </MenuItem>
          </MenuContent>
        </Menu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarSectionGroup>
          {menus.map((item) => (
            <SidebarSection
              label={item.section !== "Mailbox" ? item.section : undefined}
              key={item.section}
            >
              {item.items.map((child) => (
                <SidebarItem
                  key={child.label}
                  href={child.href}
                  tooltip={child.label}
                  isCurrent={child.label === "Inbox"}
                >
                  <child.icon />
                  <SidebarLabel>{child.label}</SidebarLabel>
                </SidebarItem>
              ))}
            </SidebarSection>
          ))}
        </SidebarSectionGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
