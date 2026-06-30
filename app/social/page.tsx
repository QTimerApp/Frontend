"use client";

import { User } from "@/components/icons";

export default function Social() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3">
      <title>QTimer - Social</title>
      <div className="size-12 rounded-full bg-accent/10 flex items-center justify-center">
        <User className="size-6 text-accent" />
      </div>
      <h1 className="text-lg font-bold text-primary">Social</h1>
      <p className="text-sm text-muted max-w-xs text-center">Friend lists, activity feeds, and sharing are coming soon.</p>
    </main>
  );
}
