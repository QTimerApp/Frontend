"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useStore } from "@/lib/stores/use";
import { Button } from "@/components/ui/Button";
import { useParams, useRouter } from "next/navigation";
import { MobileSolves } from "@/features/sessions/MobileSolves";
import { SolveSearchBar } from "@/features/sessions/SolveSearchBar";
import { SessionNav } from "@/features/sessions/Nav";
import type { SolveFilters } from "@/types/solve-search";
import { filterSolves, DEFAULT_FILTERS } from "@/lib/utils/solve-search";
import { BackArrow } from "@/components/icons";
import { useSession } from "@/lib/contexts/Session";

export default function SolvesPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { session, solves } = useSession();
  const setSelectedSessionId = useStore((s) => s.setSelectedSessionId);
  const setSelectedEventId = useStore((s) => s.setSelectedEventId);
  const [filters, setFilters] = useState<SolveFilters>(DEFAULT_FILTERS);

  useEffect(() => {
    setSelectedSessionId(id);
    if (session) setSelectedEventId(session.eventId);
    if (session === undefined) return;
    if (!session) router.push("/");
  }, [id, session, setSelectedSessionId, setSelectedEventId, router]);

  const filtered = useMemo(
    () => (solves ? filterSolves(solves, filters) : undefined),
    [solves, filters],
  );

  const goBack = useCallback(() => router.back(), [router]);

  return (
    <>
      <title>{`QTimer - ${session?.name || "Unknown"} solves`}</title>
      <SessionNav sessionId={id} />
      <main className="flex flex-col flex-1 min-w-0 overflow-y-auto">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/20">
          <Button type="button"
            onClick={goBack}
            variant="ghost"
            size="icon"
            className="rounded-lg"
            aria-label="Go back"
          >
            <BackArrow className="w-4 h-4" />
          </Button>
          <h1 className="text-sm font-bold text-primary">{session?.name || "Solves"}</h1>
        </div>
        <SolveSearchBar
          filters={filters}
          onChange={setFilters}
          resultCount={filtered?.length ?? 0}
        />
        <div className="flex-1">
          <MobileSolves solves={filtered} />
        </div>
      </main>
    </>
  );
}
