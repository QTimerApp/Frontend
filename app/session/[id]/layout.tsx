"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { SessionProvider, useSession } from "@/lib/contexts/Session";
import { Loading } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import { Info } from "@/components/icons";

function SessionCheck({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <>{children}</>;

  if (loading) return <Loading variant="page" />;

  if (!session) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
          <Info className="w-6 h-6 text-accent" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-primary">Session not found</p>
          <p className="text-xs text-muted max-w-xs">
            This session doesn&apos;t exist or may have been deleted.
          </p>
        </div>
        <Button type="button" onClick={() => router.push("/")} variant="secondary" size="md">
          Go home
        </Button>
      </main>
    );
  }

  return <>{children}</>;
}

export default function SessionLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const id = params.id as string;

  return (
    <SessionProvider sessionId={id}>
      <SessionCheck>{children}</SessionCheck>
    </SessionProvider>
  );
}
