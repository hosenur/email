"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link } from "@/components/ui/link";
import { TextField } from "@/components/ui/text-field";
import { signUp } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

const registerSchema = z
  .object({
    username: z.string().min(1, "Username is required"),
    name: z.string().min(1, "Name is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm Password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
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

      const email = `${value.username}@${ROOT_DOMAIN}`;

      try {
        const result = await signUp.email({
          email,
          password: value.password,
          name: value.name,
        });

        if (result.error) {
          setError(result.error.message || "Registration failed");
        } else {
          // Redirect to the user's subdomain
          if (ROOT_DOMAIN.includes("localhost")) {
            window.location.href = `http://${value.username}.localhost:3000`;
          } else {
            window.location.href = `https://${value.username}.${ROOT_DOMAIN}`;
          }
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
          <form.Field
            name="username"
            children={(field) => (
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
                    @{ROOT_DOMAIN}
                  </span>
                </div>
                {field.state.meta.errors ? (
                  <p className="text-sm text-danger">
                    {field.state.meta.errors.join(", ")}
                  </p>
                ) : null}
              </TextField>
            )}
          />

          <form.Field
            name="name"
            children={(field) => (
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
          />

          <form.Field
            name="password"
            children={(field) => (
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
          />

          <form.Field
            name="confirmPassword"
            children={(field) => (
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
          />

          {error && <p className="text-sm text-danger">{error}</p>}

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button type="submit" className="w-full" isDisabled={!canSubmit}>
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            )}
          />
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
