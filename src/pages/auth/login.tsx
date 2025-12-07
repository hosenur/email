"use client";

import { useRouter } from "next/router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link } from "@/components/ui/link";
import { TextField } from "@/components/ui/text-field";
import { signIn } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

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

const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

export default function LoginPage() {
  const router = useRouter();
  const subdomain = getSubdomain();
  const email = subdomain ? `${subdomain}@${ROOT_DOMAIN}` : "";

  const [error, setError] = useState("");

  const form = useForm({
    defaultValues: {
      password: "",
    },
    validators: {
      onDynamic: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setError("");

      if (!email) {
        setError("Email is missing (not on a subdomain)");
        return;
      }

      try {
        const result = await signIn.email({
          email,
          password: value.password,
        });

        if (result.error) {
          setError(result.error.message || "Sign in failed");
        } else {
          router.push("/");
        }
      } catch {
        setError("An unexpected error occurred");
      }
    },
  });

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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <TextField isDisabled>
            <Label>Email</Label>
            <Input type="email" value={email} disabled />
          </TextField>

          <form.Field
            name="password"
            children={(field) => (
              <TextField>
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.errors ? (
                  <p className="text-sm text-danger">
                    {field.state.meta.errors.join(", ")}
                  </p>
                ) : null}
              </TextField>
            )}
          />

          {error && <p className="text-sm text-danger">{error}</p>}

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                className="w-full"
                isDisabled={!canSubmit || !email}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            )}
          />
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
