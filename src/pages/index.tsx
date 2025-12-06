"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main email interface
    router.push("/s/inbox");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-bg">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        <p className="text-muted-fg">Loading...</p>
      </div>
    </div>
  );
}
