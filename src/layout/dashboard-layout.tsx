"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import EmailSidebar from "@/components/email-sidebar";
import AppSidebar from "@/components/app-sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <EmailSidebar />
      <SidebarInset>{children}</SidebarInset>
      <AppSidebar />
    </SidebarProvider>
  );
}
