import { createRouter } from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen.ts";

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultStaleTime: 5_000,
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
