"use client";

import SettingsIcon from "@/components/icons/settings";
import SettingsLayout from "@/layout/settings-layout";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <SettingsLayout>
      <div className="mx-auto max-w-4xl p-6">
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
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-fg">
                    Email Signature
                  </h3>
                  <p className="text-sm text-muted-fg">
                    Set a default signature for your sent emails
                  </p>
                </div>
                <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary/90">
                  Configure
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
}
