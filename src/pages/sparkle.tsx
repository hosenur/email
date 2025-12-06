"use client";

import SparkleIcon from "@/components/icons/sparkle";
import { DashboardLayout } from "@/layout/dashboard-layout";

export default function SparklePage() {
  return (
    <DashboardLayout>
      <div className="h-screen bg-bg">
        <div className="flex h-full flex-col items-center justify-center bg-bg">
          <div className="w-full max-w-md space-y-6 p-8">
            <div className="rounded-lg p-6">
              <div className="flex items-center justify-center py-8">
                <SparkleIcon className="h-8 w-8 text-muted-fg" />
              </div>
              <h2 className="mb-4 text-center text-lg font-medium text-fg">
                Sparkle
              </h2>
              <p className="text-center text-muted-fg">
                AI-powered email insights will appear here
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
