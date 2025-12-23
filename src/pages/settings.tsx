"use client";

import { useEffect, useState } from "react";
import SettingsIcon from "@/components/icons/settings";
import SettingsLayout from "@/layout/settings-layout";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "next-themes";
import useSWR from "swr";

interface UserResponse {
  user: {
    id: string;
    email: string;
    name: string;
    signature: string | null;
    image: string | null;
  };
}

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => res.json());

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [signature, setSignature] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<UserResponse>(
    "/api/users",
    fetcher,
  );

  const currentUser = data?.user;

  useEffect(() => {
    if (currentUser?.signature !== undefined) {
      setSignature(currentUser.signature || "");
    }
  }, [currentUser?.signature]);

  const handleSaveSignature = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ signature }),
      });

      if (!res.ok) {
        throw new Error("Failed to save signature");
      }

      const result = await res.json();
      mutate(result, false);
    } catch (error) {
      console.error("Error saving signature:", error);
      alert("Failed to save signature");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsLayout>
      <div className="w-full p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-6 w-6 text-fg" />
            <h1 className="text-2xl font-semibold text-fg">Settings</h1>
          </div>
          <p className="mt-2 text-sm text-muted-fg">
            Manage your account and application preferences
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-secondary/50 p-6">
            <h2 className="mb-4 text-lg font-medium text-fg">Appearance</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-fg">Theme</h3>
                  <p className="text-sm text-muted-fg">
                    Choose your preferred color scheme
                  </p>
                </div>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-secondary/50 p-6">
            <h2 className="mb-4 text-lg font-medium text-fg">
              Email Preferences
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-fg">AI Summaries</h3>
                  <p className="text-sm text-muted-fg">
                    Enable AI-powered email summaries
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    defaultChecked
                  />
                  <div className="peer h-6 w-11 rounded-full bg-border after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-bg after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-fg">
                    Email Notifications
                  </h3>
                  <p className="text-sm text-muted-fg">
                    Get notified about new emails
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    defaultChecked
                  />
                  <div className="peer h-6 w-11 rounded-full bg-border after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-bg after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-secondary/50 p-6">
            <h2 className="mb-4 text-lg font-medium text-fg">Account</h2>
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-sm font-medium text-fg">
                  Email Signature
                </h3>
                <p className="mb-4 text-sm text-muted-fg">
                  Set a default signature for your sent emails
                </p>
                {isLoading ? (
                  <div className="h-24 animate-pulse rounded-lg bg-border" />
                ) : (
                  <div className="space-y-2">
                    <Textarea
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      placeholder="Best regards,&#10;Your Name"
                      className="min-h-24"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleSaveSignature}
                        disabled={isSaving}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary/90 disabled:opacity-50"
                      >
                        {isSaving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
}
