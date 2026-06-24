"use client";

import {
  Cog6ToothIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useLocation } from "@tanstack/react-router";
import AppSidebar from "@/components/sidebar/app-sidebar";
import EmailSidebar from "@/components/sidebar/email-sidebar";
import { Button, buttonStyles } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import {
  SidebarInset,
  SidebarNav,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useSelectedEmailId } from "@/hooks/use-selected-email-id";
import { AuthLayout } from "./auth-layout";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const [selectedId] = useSelectedEmailId();
  const isMailboxRoute =
    location.pathname.includes("/inbox") || location.pathname.includes("/sent");

  function focusSearch() {
    document.getElementById("mail-search")?.focus();
  }

  return (
    <AuthLayout>
      <SidebarProvider>
        <AppSidebar closeButton={false} collapsible="dock" />
        <SidebarInset
          className={isMailboxRoute ? "h-screen overflow-hidden" : undefined}
        >
          {isMailboxRoute ? (
            <div className="flex h-full min-h-0 flex-col">
              <SidebarNav className="border-b sm:hidden" isSticky>
                <SidebarTrigger className="sm:hidden" />
                <div className="ms-auto flex w-full items-center justify-end gap-x-2">
                  <Button
                    aria-label="Search messages"
                    intent="plain"
                    isCircle
                    size="sq-sm"
                    onPress={focusSearch}
                  >
                    <MagnifyingGlassIcon />
                  </Button>
                  <Link
                    aria-label="Settings"
                    href="/settings"
                    className={buttonStyles({
                      intent: "plain",
                      isCircle: true,
                      size: "sq-sm",
                    })}
                  >
                    <Cog6ToothIcon />
                  </Link>
                </div>
              </SidebarNav>
              <div className="grid min-h-0 flex-1 grid-cols-1 sm:grid-cols-[22rem_minmax(0,1fr)]">
                <div
                  className={
                    selectedId
                      ? "hidden min-h-0 sm:block sm:border-r"
                      : "min-h-0 sm:border-r"
                  }
                >
                  <EmailSidebar />
                </div>
                <div
                  className={
                    selectedId
                      ? "block min-h-0 overflow-y-auto"
                      : "hidden min-h-0 overflow-y-auto sm:block"
                  }
                >
                  {children}
                </div>
              </div>
            </div>
          ) : (
            children
          )}
        </SidebarInset>
      </SidebarProvider>
    </AuthLayout>
  );
}
