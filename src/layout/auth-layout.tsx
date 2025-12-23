import { useSession } from "@/lib/auth-client";
import { Loader } from "@/components/ui/loader";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <Loader />
      </div>
    );
  }

  return <>{children}</>;
}
