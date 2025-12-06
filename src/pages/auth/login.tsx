"use client";

import { useRouter } from "next/router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link } from "@/components/ui/link";
import { TextField } from "@/components/ui/text-field";
import { useAccounts } from "@/hooks/use-accounts";
import { signIn } from "@/lib/auth-client";

function getSubdomain(): string {
  if (typeof window === "undefined") return "";

  const hostname = window.location.hostname;
  const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost";

  // Local development
  if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
    if (hostname.includes(".localhost")) {
      return hostname.split(".")[0];
    }
    return "";
  }

  // Production
  const rootDomainFormatted = ROOT_DOMAIN.split(":")[0];
  if (hostname.endsWith(`.${rootDomainFormatted}`)) {
    return hostname.replace(`.${rootDomainFormatted}`, "");
  }

  return "";
}

export default function LoginPage() {
  const router = useRouter();
  const subdomain = getSubdomain();
  const email = subdomain ? `${subdomain}@hosenur.email` : "";
  const { addAccount } = useAccounts();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Sign in failed");
      } else {
        addAccount(email, subdomain);
        router.push("/");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="w-full max-w-sm space-y-6 rounded-xl bg-overlay p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-fg">
            Sign in
          </h1>
          <p className="text-sm text-muted-fg">
            Enter your password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField isDisabled>
            <Label>Email</Label>
            <Input type="email" value={email} disabled />
          </TextField>

          <TextField>
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </TextField>

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button
            type="submit"
            className="w-full"
            isDisabled={loading || !email}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-fg">
          Don't have an account?{" "}
          <Link href="/auth/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
