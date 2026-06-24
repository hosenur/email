"use client";

import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { TextField } from "@/components/ui/text-field";
import { useAccounts } from "@/hooks/use-accounts";
import { signIn } from "@/lib/auth-client";
import { getSubdomainFromHost, getTenantEmail } from "@/lib/tenant";

export const Route = createFileRoute("/auth")({
  validateSearch: (search): { redirect?: string } => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: SubdomainAuthPage,
});

const authSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export default function SubdomainAuthPage() {
  const navigate = useNavigate();
  const routeSearch = Route.useSearch();
  const { addAccount } = useAccounts();
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [error, setError] = useState("");

  const email = subdomain ? getTenantEmail(subdomain) : "";

  const form = useForm({
    defaultValues: {
      password: "",
    },
    validators: {
      onDynamic: authSchema,
    },
    onSubmit: async ({ value }) => {
      setError("");

      try {
        const result = await signIn.email({
          email,
          password: value.password,
        });

        if (result.error) {
          setError(result.error.message || "Sign in failed");
        } else {
          addAccount(email);
          if (routeSearch.redirect?.startsWith("/")) {
            window.location.href = routeSearch.redirect;
          } else {
            navigate({ to: "/inbox" });
          }
        }
      } catch {
        setError("An unexpected error occurred");
      }
    },
  });

  useEffect(() => {
    const detectedSubdomain = getSubdomainFromHost(window.location.host);
    if (!detectedSubdomain) {
      navigate({ to: "/auth/login" });
      return;
    }
    setSubdomain(detectedSubdomain);
  }, [navigate]);

  // Show loading state until subdomain is detected
  if (subdomain === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="w-full max-w-sm space-y-6 rounded-xl bg-overlay p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-fg">
            Sign in to {subdomain}
          </h1>
          <p className="text-sm text-muted-fg">
            Enter your password to access your inbox
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

          <form.Field name="password">
            {(field) => (
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
          </form.Field>

          {error && <p className="text-sm text-danger">{error}</p>}

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" className="w-full" isDisabled={!canSubmit}>
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="text-center text-sm text-muted-fg">
          Contact an administrator to create a mailbox.
        </p>
      </div>
    </div>
  );
}
