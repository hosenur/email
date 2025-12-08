"use client";

import AppSidebar from "@/components/sidebar/app-sidebar";
import EmailSidebar from "@/components/sidebar/email-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AuthLayout } from "./auth-layout";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthLayout>

      <SidebarProvider>
        <EmailSidebar intent="float" />
        <SidebarInset>{children}</SidebarInset>
        <AppSidebar side="right" intent="float" />
      </SidebarProvider>
    </AuthLayout>
  );
}
