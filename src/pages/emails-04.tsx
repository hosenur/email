import { AppSidebar } from "@/components/app-sidebar";
import { AppSidebarNav } from "@/components/app-sidebar-nav";
import { EmailDetails } from "@/components/email-details";
import { ListEmails } from "@/components/list-emails";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-screen overflow-hidden">
        <div className="flex h-full min-h-0 flex-col">
          <AppSidebarNav />
          <div className="grid min-h-0 flex-1 grid-cols-1 sm:grid-cols-[22rem_minmax(0,1fr)]">
            <div className="min-h-0 sm:border-r">
              <ListEmails />
            </div>
            <div className="hidden min-h-0 overflow-y-auto sm:block">
              <EmailDetails />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
