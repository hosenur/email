"use client";

import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "@/lib/auth-client";
import { DashboardLayout } from "@/layout/dashboard-layout";

export default function SubdomainPage() {
  const router = useRouter();
  const { subdomain } = router.query;
  const { data: session } = useSession();

  async function handleSignOut() {
    await signOut();
    router.push("/auth");
  }

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg">
        <div className="w-full max-w-md space-y-6 rounded-xl bg-overlay p-8 shadow-lg">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-fg">
              Welcome to {subdomain}
            </h1>
            <p className="text-sm text-muted-fg">
              You are signed in as{" "}
              {session?.user?.email || `${subdomain}@hosenur.email`}
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-secondary/50 p-4">
              <h2 className="font-medium text-fg">Your Inbox</h2>
              <p className="mt-1 text-sm text-muted-fg">No messages yet</p>
            </div>

            <Button
              intent="secondary"
              className="w-full"
              onPress={handleSignOut}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
