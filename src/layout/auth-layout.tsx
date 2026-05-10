import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Loader } from "@/components/ui/loader";
import { signOut, useSession } from "@/lib/auth-client";
import { getCurrentSubdomain, getMailboxEmail } from "@/lib/mailbox";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (isPending) {
      return;
    }

    const routeSubdomain =
      typeof router.query.subdomain === "string"
        ? router.query.subdomain
        : null;
    const subdomain = routeSubdomain || getCurrentSubdomain();

    if (!subdomain) {
      return;
    }

    const expectedEmail = getMailboxEmail(subdomain);

    if (session?.user.email.toLowerCase() === expectedEmail.toLowerCase()) {
      return;
    }

    setIsRedirecting(true);

    if (session) {
      void signOut();
    }

    window.location.href = "/auth";
  }, [isPending, router.query.subdomain, session]);

  if (isPending || isRedirecting) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <Loader />
      </div>
    );
  }

  return <>{children}</>;
}
