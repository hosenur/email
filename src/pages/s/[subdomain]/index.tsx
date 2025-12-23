"use client";

import { useRouter } from "next/router";
import { useEffect } from "react";
import { Loader } from "@/components/ui/loader";

export default function SubdomainIndexPage() {
  const router = useRouter();
  const { subdomain } = router.query;

  useEffect(() => {
    if (subdomain) {
      router.replace(`/s/${subdomain}/inbox`);
    }
  }, [subdomain, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Loader />
    </div>
  );
}
