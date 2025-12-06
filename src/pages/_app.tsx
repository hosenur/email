import "@/styles/globals.css";
import "@fontsource/geist-sans";
import type { AppProps } from "next/app";
import { NuqsAdapter } from "nuqs/adapters/next/pages";
import { ThemeProvider } from "next-themes";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class">
      <NuqsAdapter>
        <Component {...pageProps} />
      </NuqsAdapter>
    </ThemeProvider>
  );
}
