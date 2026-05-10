"use client";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link } from "@/components/ui/link";
import { TextField } from "@/components/ui/text-field";
import { useAccounts } from "@/hooks/use-accounts";
import { createMailboxAuthClient } from "@/lib/auth-client";
import {
  getMailboxEmail,
  getMailboxOrigin,
  getMailDomain,
} from "@/lib/mailbox";

const SUBDOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, "Username is required")
      .regex(SUBDOMAIN_PATTERN, "Use letters, numbers, or hyphens"),
    name: z.string().min(1, "Name is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm Password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  const { addAccount } = useAccounts();
  const [error, setError] = useState("");

  const form = useForm({
    defaultValues: {
      username: "",
      name: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onDynamic: registerSchema,
    },
    onSubmit: async ({ value }) => {
      setError("");

      const username = value.username.toLowerCase();
      const email = getMailboxEmail(username);
      const mailboxOrigin = getMailboxOrigin(username);
      const mailboxAuthClient = createMailboxAuthClient(mailboxOrigin);

      try {
        const result = await mailboxAuthClient.signUp.email({
          email,
          password: value.password,
          name: value.name,
        });

        if (result.error) {
          setError(result.error.message || "Registration failed");
        } else {
          addAccount(email);
          window.location.href = mailboxOrigin;
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
            Create an account
          </h1>
          <p className="text-sm text-muted-fg">
            Register to claim your email address
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
          <form.Field name="username">
            {(field) => (
              <TextField>
                <Label>Username</Label>
                <div className="flex">
                  <Input
                    type="text"
                    placeholder="username"
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(e.target.value.toLowerCase())
                    }
                    onBlur={field.handleBlur}
                    className="rounded-r-none"
                  />
                  <span className="inline-flex items-center rounded-r-lg border border-l-0 border-border bg-secondary px-3 text-sm text-muted-fg">
                    @{getMailDomain()}
                  </span>
                </div>
                {field.state.meta.errors ? (
                  <p className="text-sm text-danger">
                    {field.state.meta.errors.join(", ")}
                  </p>
                ) : null}
              </TextField>
            )}
          </form.Field>

          <form.Field name="name">
            {(field) => (
              <TextField>
                <Label>Name</Label>
                <Input
                  type="text"
                  placeholder="Enter your name"
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

          <form.Field name="password">
            {(field) => (
              <TextField>
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="Create a password"
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

          <form.Field name="confirmPassword">
            {(field) => (
              <TextField>
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="Confirm your password"
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
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="text-center text-sm text-muted-fg">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
