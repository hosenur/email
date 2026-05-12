"use client";

import { AppSidebarNav } from "@/components/app-sidebar-nav";
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
        <AppSidebar closeButton={false} collapsible="dock" />
        <SidebarInset className="h-screen overflow-hidden">
          <div className="flex h-full min-h-0 flex-col">
            <AppSidebarNav />
            <div className="grid min-h-0 flex-1 grid-cols-1 sm:grid-cols-[22rem_minmax(0,1fr)]">
              <EmailSidebar className="min-h-0 sm:border-r" />
              <div className="min-h-0 overflow-y-auto">{children}</div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthLayout>
  );
}
