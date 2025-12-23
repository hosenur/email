import "@/styles/globals.css";
import "@fontsource/geist-sans";
import type { AppProps } from "next/app";
import { NuqsAdapter } from "nuqs/adapters/next/pages";
import { ThemeProvider } from "next-themes";
import { ClientSideRoutingProvider } from "@/providers/client-side-routing";

export default function App({ Component, pageProps }: AppProps) {
  if (!process.env.NEXT_PUBLIC_ROOT_DOMAIN) {
    throw new Error("NEXT_PUBLIC_ROOT_DOMAIN is missing in .env");
  }
  return (
    <ClientSideRoutingProvider>
      <ThemeProvider attribute="class">
        <NuqsAdapter>
          <Component {...pageProps} />
        </NuqsAdapter>
      </ThemeProvider>
    </ClientSideRoutingProvider>
  );
}
