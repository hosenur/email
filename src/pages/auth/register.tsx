"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link } from "@/components/ui/link";
import { TextField } from "@/components/ui/text-field";
import { signUp } from "@/lib/auth-client";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!username) {
      setError("Username is required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    const email = `${username}@hosenur.email`;

    try {
      const result = await signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        setError(result.error.message || "Registration failed");
      } else {
        // Redirect to the user's subdomain
        if (ROOT_DOMAIN.includes("localhost")) {
          window.location.href = `http://${username}.localhost:3000`;
        } else {
          window.location.href = `https://${username}.${ROOT_DOMAIN}`;
        }
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
            Create an account
          </h1>
          <p className="text-sm text-muted-fg">
            Register to claim your email address
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField>
            <Label>Username</Label>
            <div className="flex">
              <Input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="rounded-r-none"
              />
              <span className="inline-flex items-center rounded-r-lg border border-l-0 border-border bg-secondary px-3 text-sm text-muted-fg">
                @hosenur.email
              </span>
            </div>
          </TextField>

          <TextField>
            <Label>Name</Label>
            <Input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </TextField>

          <TextField>
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </TextField>

          <TextField>
            <Label>Confirm Password</Label>
            <Input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </TextField>

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button
            type="submit"
            className="w-full"
            isDisabled={
              loading || !username || !name || !password || !confirmPassword
            }
          >
            {loading ? "Creating account..." : "Create account"}
          </Button>
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
