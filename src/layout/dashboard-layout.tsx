"use client";

import AppSidebar from "@/components/app-sidebar";
import EmailSidebar from "@/components/email-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <EmailSidebar intent="float" />
      <SidebarInset>{children}</SidebarInset>
      <AppSidebar side="right" intent="float" />
    </SidebarProvider>
  );
}
