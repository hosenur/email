"use client";

import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { TextField } from "@/components/ui/text-field";
import { signIn } from "@/lib/auth-client";
import { getSubdomainFromHost, getTenantEmail } from "@/lib/tenant";

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
});

const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const subdomain =
    typeof window === "undefined"
      ? null
      : getSubdomainFromHost(window.location.host);
  const email = subdomain ? getTenantEmail(subdomain) : "";

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
          navigate({ to: "/inbox" });
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
              <Button
                type="submit"
                className="w-full"
                isDisabled={!canSubmit || !email}
              >
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
