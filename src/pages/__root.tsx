import {
  createRootRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "@/components/theme-provider";
import { Toast } from "@/components/ui/toast";
import { ClientSideRoutingProvider } from "@/providers/client-side-routing";

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});

function RootLayout() {
  const location = useLocation();
  const isMarketingPage = location.pathname === "/";

  return (
    <ThemeProvider>
      <ClientSideRoutingProvider>
        <div className={isMarketingPage ? undefined : "min-h-screen bg-bg"}>
          <Outlet />
        </div>
        <Toast />
      </ClientSideRoutingProvider>
      <TanStackRouterDevtools position="bottom-right" />
    </ThemeProvider>
  );
}

function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-bg p-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium text-muted-fg">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-fg">
          That route does not exist.
        </h1>
        <Link
          className="mt-4 inline-flex text-sm font-medium text-primary"
          to="/"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
