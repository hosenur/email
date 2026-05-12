"use client";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { TextField } from "@/components/ui/text-field";
import { useAccounts } from "@/hooks/use-accounts";
import { createMailboxAuthClient, signIn, signOut } from "@/lib/auth-client";
import {
  getCurrentSubdomain,
  getMailboxEmail,
  getMailboxOrigin,
  getMailDomain,
  getSubdomainFromEmail,
  isMailboxEmail,
} from "@/lib/mailbox";

const loginSchema = z.object({
  email: z.string(),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const { addAccount } = useAccounts();
  const subdomain = getCurrentSubdomain();
  const subdomainEmail = subdomain ? getMailboxEmail(subdomain) : "";
  const isMailboxLogin = Boolean(subdomainEmail);

  const [error, setError] = useState("");

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onDynamic: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setError("");

      const email = subdomainEmail || value.email.trim().toLowerCase();
      const parsedEmail = z.email().safeParse(email);

      if (!parsedEmail.success) {
        setError("Enter a valid email address");
        return;
      }

      if (subdomainEmail && !isMailboxEmail(email)) {
        setError(`Enter a valid @${getMailDomain()} email address`);
        return;
      }

      try {
        if (!subdomainEmail) {
          const result = await signIn.email({
            email,
            password: value.password,
          });

          if (result.error) {
            setError(result.error.message || "Sign in failed");
            return;
          }

          const adminResponse = await fetch("/api/users", {
            credentials: "include",
          });

          if (!adminResponse.ok) {
            await signOut();
            setError("Admin access required");
            return;
          }

          const adminData = (await adminResponse.json()) as {
            user?: { isAdmin?: boolean };
          };

          if (!adminData.user?.isAdmin) {
            await signOut();
            setError("Admin access required");
            return;
          }

          window.location.href = "/admin";
          return;
        }

        const targetSubdomain = getSubdomainFromEmail(email);
        const targetOrigin = getMailboxOrigin(targetSubdomain);
        const mailboxAuthClient = createMailboxAuthClient(targetOrigin);
        const result = await mailboxAuthClient.signIn.email({
          email,
          password: value.password,
        });

        if (result.error) {
          setError(result.error.message || "Sign in failed");
        } else {
          addAccount(email);
          window.location.href = targetOrigin;
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
            {isMailboxLogin ? "Sign in" : "Admin sign in"}
          </h1>
          <p className="text-sm text-muted-fg">
            {isMailboxLogin
              ? "Enter your password to continue"
              : "Use an admin account to manage users"}
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
          {subdomainEmail ? (
            <TextField isDisabled>
              <Label>Email</Label>
              <Input type="email" value={subdomainEmail} disabled />
            </TextField>
          ) : (
            <form.Field name="email">
              {(field) => (
                <TextField>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder={`admin@${getMailDomain()}`}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </TextField>
              )}
            </form.Field>
          )}

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
          Accounts are created by an administrator.
        </p>
      </div>
    </div>
  );
}
