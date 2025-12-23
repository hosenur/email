"use client";

import { RouterProvider } from "react-aria-components";
import { useRouter } from "next/router";
import type { ReactNode } from "react";

export function ClientSideRoutingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();

  return (
    <RouterProvider
      navigate={(href: string) => {
        router.push(href);
      }}
    >
      {children}
    </RouterProvider>
  );
}
