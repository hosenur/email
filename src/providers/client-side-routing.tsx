"use client";

import { useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { RouterProvider } from "react-aria-components";

export function ClientSideRoutingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();

  return (
    <RouterProvider
      navigate={(href: string) => {
        router.navigate({ to: href });
      }}
    >
      {children}
    </RouterProvider>
  );
}
