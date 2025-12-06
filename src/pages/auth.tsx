"use client";

import { useRouter } from "next/router";
import { Geist } from "next/font/google";
import { TextField } from "@/components/ui/text-field";
import { Label } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function AuthPage() {
  const router = useRouter();
  const subdomain = (router.query.subdomain as string) || "";
  const email = subdomain ? `${subdomain}@hosenur.email` : "";

  return (
    <div
      className={`${geistSans.className} flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black`}
    >
      <div className="w-full max-w-sm space-y-6 rounded-xl bg-white p-8 shadow-lg dark:bg-zinc-900">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-fg">
            Sign in
          </h1>
          <p className="text-sm text-muted-fg">
            Enter your password to continue
          </p>
        </div>

        <form className="space-y-4">
          <TextField isDisabled>
            <Label>Email</Label>
            <Input type="email" value={email} disabled />
          </TextField>

          <TextField>
            <Label>Password</Label>
            <Input type="password" placeholder="Enter your password" />
          </TextField>

          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
