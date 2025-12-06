"use client";

import SettingsSidebar from "@/components/settings-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <SidebarProvider>
      <SettingsSidebar intent="float" />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
