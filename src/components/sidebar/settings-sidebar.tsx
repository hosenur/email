"use client";

import UserIcon from "@/components/icons/user";
import LockIcon from "@/components/icons/lock";
import DangerIcon from "@/components/icons/danger";
import {
  Sidebar,
  SidebarContent,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSectionGroup,
} from "@/components/ui/sidebar";

export default function SettingsSidebar(
  props: React.ComponentProps<typeof Sidebar>,
) {
  return (
    <Sidebar {...props}>
      <SidebarContent>
        <SidebarSectionGroup>
          <SidebarSection>
            <SidebarItem
              tooltip="Account"
              href="/settings/account"
              className="gap-3"
            >
              <UserIcon className="h-4 w-4" />
              <SidebarLabel>Account</SidebarLabel>
            </SidebarItem>
            <SidebarItem
              tooltip="Security"
              href="/settings/privacy"
              className="gap-3"
            >
              <LockIcon className="h-4 w-4" />
              <SidebarLabel>Security</SidebarLabel>
            </SidebarItem>
            <SidebarItem
              tooltip="Danger Zone"
              href="/settings/danger"
              className="gap-3"
            >
              <DangerIcon className="h-4 w-4" />
              <SidebarLabel>Danger Zone</SidebarLabel>
            </SidebarItem>
          </SidebarSection>
        </SidebarSectionGroup>
      </SidebarContent>
    </Sidebar>
  );
}
