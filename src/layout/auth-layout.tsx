import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader } from "@/components/ui/loader";
import { useSession } from "@/lib/auth-client";
import {
  getSubdomainFromHost,
  getTenantUrl,
  isEmailAllowedForSubdomain,
} from "@/lib/tenant";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: session, isPending } = useSession();
  const subdomain =
    typeof window === "undefined"
      ? null
      : getSubdomainFromHost(window.location.host);
  const isWrongTenant =
    !!session?.user?.email &&
    !!subdomain &&
    !isEmailAllowedForSubdomain(session.user.email, subdomain);

  useEffect(() => {
    if (!isPending && !session?.user) {
      navigate({
        to: "/auth",
        search: {
          redirect: location.href,
        },
      });
      return;
    }

    if (!isWrongTenant || !session?.user?.email) return;

    window.location.href = getTenantUrl(session.user.email);
  }, [
    isPending,
    isWrongTenant,
    location.href,
    navigate,
    session?.user,
    session?.user?.email,
  ]);

  if (isPending || !session?.user || isWrongTenant) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <Loader />
      </div>
    );
  }

  return <>{children}</>;
}
