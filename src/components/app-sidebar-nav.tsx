import {
  Cog6ToothIcon,
  MagnifyingGlassIcon,
} from "@/components/icons/lucide";
import { Button, buttonStyles } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { SidebarNav, SidebarTrigger } from "@/components/ui/sidebar";

export function AppSidebarNav() {
  return (
    <SidebarNav className="border-b sm:hidden" isSticky>
      <SidebarTrigger className="sm:hidden" />
      <div className="ms-auto flex w-full items-center justify-end gap-x-2">
        <Button intent="plain" isCircle size="sq-sm">
          <MagnifyingGlassIcon />
        </Button>
        <Link
          href="#"
          className={buttonStyles({
            size: "sq-sm",
            intent: "plain",
            isCircle: true,
          })}
        >
          <Cog6ToothIcon />
        </Link>
      </div>
    </SidebarNav>
  );
}
