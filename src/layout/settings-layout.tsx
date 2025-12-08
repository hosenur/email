"use client";

import SettingsSidebar from "@/components/sidebar/settings-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AuthLayout } from "./auth-layout";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <AuthLayout>

      <SidebarProvider>
        <SettingsSidebar intent="float" />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </AuthLayout>
  );
}
