"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import BellIcon from "@/components/icons/bell";
import LinkIcon from "@/components/icons/link";
import PaletteIcon from "@/components/icons/palette";
import ShieldIcon from "@/components/icons/shield";
import SparkleIcon from "@/components/icons/sparkle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const heroFeatures = [
  {
    icon: LinkIcon,
    title: "Custom domain email",
    description: "Host email for your own domain with ease",
  },
  {
    icon: SparkleIcon,
    title: "AI-powered inbox",
    description: "Smart categorization and summaries",
  },
  {
    icon: ShieldIcon,
    title: "Subdomain access",
    description: "Each mailbox gets its own subdomain",
  },
  {
    icon: PaletteIcon,
    title: "Modern stack",
    description: "Next.js, React, Tailwind, Prisma",
  },
];

const features = [
  {
    icon: SparkleIcon,
    title: "AI Summaries & TLDR",
    description:
      "Get instant AI-generated summaries and action items for every email in your inbox.",
  },
  {
    icon: BellIcon,
    title: "Real-time Updates",
    description:
      "Emails appear instantly without refreshing. Stay on top of your inbox effortlessly.",
  },
  {
    icon: PaletteIcon,
    title: "Dark & Light Theme",
    description:
      "Beautiful interface with native dark mode support and full accessibility.",
  },
  {
    icon: ShieldIcon,
    title: "Secure Authentication",
    description:
      "Robust session management with IP tracking and secure auth flows.",
  },
];

export default function Home() {
  const names = ["john", "sarah", "team", "hello", "info", "support"];
  const [nameIndex, setNameIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setNameIndex((prev) => (prev + 1) % names.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#fbf1c7] text-[#3c3836] font-['Google_Sans'] selection:bg-[#d65d0e]/20 selection:text-[#d65d0e]">
      <Head>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap');`}</style>
        <title>hosenur.email - Self-hosted Email for Your Domain</title>
        <meta
          name="description"
          content="Open-source, self-hosted email platform. Own your data. Create professional email addresses like you@yourdomain.com"
        />
      </Head>

      <main>
        <section className="pt-20 pb-16 md:pt-32 md:pb-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-20">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ebdbb2] border border-[#d5c4a1] text-xs font-medium mb-6 text-[#3c3836]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#98971a] animate-pulse" />
                  Open Source & Self-Hosted
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-['Instrument_Serif'] font-bold tracking-tight mb-6 text-[#3c3836]">
                  Self-hosted email for your domain
                </h1>

                <p className="text-lg md:text-xl text-[#7c6f64] mb-8 max-w-xl leading-relaxed">
                  Open-source email platform. Host it yourself. Own your data.
                  Create professional addresses like{" "}
                  <span className="text-[#3c3836] font-medium">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={names[nameIndex]}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="inline-block"
                      >
                        {names[nameIndex]}
                      </motion.span>
                    </AnimatePresence>
                    @yourdomain.com
                  </span>{" "}
                  and access it on{" "}
                  <span className="text-[#3c3836] font-medium">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={`subdomain-${names[nameIndex]}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="inline-block"
                      >
                        {names[nameIndex]}
                      </motion.span>
                    </AnimatePresence>
                    .yourdomain.com
                  </span>
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link href="https://vercel.com/new/clone?repository-url=https://github.com/hosenur/email">
                    <Button
                      size="lg"
                      className="h-12 px-6 gap-2 bg-[#d65d0e] text-white hover:bg-[#d65d0e]/90 border-transparent"
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 76 65"
                        fill="none"
                        role="img"
                        aria-label="Vercel"
                      >
                        <path
                          d="M37.5274 0L75.0548 65H0L37.5274 0Z"
                          fill="currentColor"
                        />
                      </svg>
                      Deploy to Vercel
                    </Button>
                  </Link>
                  <a
                    href="https://github.com/hosenur/email"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      intent="outline"
                      size="lg"
                      className="h-12 px-6 gap-2 border-[#d5c4a1] text-[#3c3836] hover:bg-[#ebdbb2]"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        role="img"
                        aria-label="GitHub"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      View on GitHub
                    </Button>
                  </a>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center space-y-6 lg:pl-10 lg:border-l border-[#d5c4a1]/50">
                {heroFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.title} className="flex gap-4">
                      <Icon className="w-5 h-5 mt-0.5 text-[#7c6f64] shrink-0" />
                      <div>
                        <h2 className="font-['Instrument_Serif'] font-semibold text-[#3c3836]">
                          {feature.title}
                        </h2>
                        <p className="text-sm text-[#7c6f64]">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-16 md:mt-24">
              <div className="relative rounded-2xl border border-[#d5c4a1] shadow-2xl overflow-hidden bg-[#fbf1c7]">
                <Image
                  src="/banner.png"
                  width={1200}
                  height={600}
                  alt="hosenur.email interface"
                  className="w-full h-auto"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-24 md:py-32 bg-[#ebdbb2]/50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-2xl mb-16">
              <h2 className="text-3xl md:text-4xl font-['Instrument_Serif'] font-bold tracking-tight mb-4 text-[#3c3836]">
                Everything you need to run your own email
              </h2>
              <p className="text-lg text-[#7c6f64]">
                A complete email solution you can deploy on your own
                infrastructure.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="p-6 rounded-xl border border-[#d5c4a1] bg-[#fbf1c7] hover:shadow-lg transition-shadow"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#ebdbb2] flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-[#3c3836]" />
                    </div>
                    <h3 className="text-lg font-['Instrument_Serif'] font-semibold mb-2 text-[#3c3836]">
                      {feature.title}
                    </h3>
                    <p className="text-[#7c6f64]">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-24 md:py-32">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-['Instrument_Serif'] font-bold tracking-tight mb-4 text-[#3c3836]">
                Ready to self-host?
              </h2>
              <p className="text-lg text-[#7c6f64] mb-8">
                Deploy your own instance in minutes. Full control, no vendor
                lock-in.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="https://vercel.com/new/clone?repository-url=https://github.com/hosenur/email">
                  <Button
                    size="lg"
                    className="h-12 px-8 gap-2 bg-[#d65d0e] text-white hover:bg-[#d65d0e]/90 border-transparent"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 76 65"
                      fill="none"
                      role="img"
                      aria-label="Vercel"
                    >
                      <path
                        d="M37.5274 0L75.0548 65H0L37.5274 0Z"
                        fill="currentColor"
                      />
                    </svg>
                    Deploy to Vercel
                  </Button>
                </Link>
                <a
                  href="https://github.com/hosenur/email"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    intent="outline"
                    size="lg"
                    className="h-12 px-8 border-[#d5c4a1] text-[#3c3836] hover:bg-[#ebdbb2]"
                  >
                    View Documentation
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-[#d5c4a1]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#d65d0e] flex items-center justify-center text-white">
                <span className="font-bold text-xs">h</span>
              </div>
              <span className="font-semibold text-[#3c3836]">
                hosenur.email
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm text-[#7c6f64]">
              <a
                href="https://github.com/hosenur/email"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#3c3836] transition-colors"
              >
                GitHub
              </a>
              <Separator orientation="vertical" className="h-4 bg-[#d5c4a1]" />
              <span>&copy; {new Date().getFullYear()} Open Source</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
