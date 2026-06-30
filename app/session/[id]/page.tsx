"use client";

import { useStore } from "@/lib/stores/use";
import { useSettingsStore } from "@/lib/stores/useSettings";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { Scramble } from "@/features/timer/Scramble";
import { Solves } from "@/features/sessions/Solves";
import { SolveHeader } from "@/features/sessions/SolveHeader";
import { Timer } from "@/features/timer";
import { Panel as StatsPanel } from "@/features/statistics/Panel";
import { SessionNav } from "@/features/sessions/Nav";
import { useSession } from "@/lib/contexts/Session";

const ScramblePreview = dynamic(() => import("@/features/timer/ScramblePreview"), { ssr: false });
import { useParams, useRouter } from "next/navigation";
import { Menu } from "@/components/icons";

export default function Session() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { session } = useSession();
  const showScrambleImage = useSettingsStore((s) => s.settings.showScrambleImage);
  const setSelectedSessionId = useStore((s) => s.setSelectedSessionId);
  const setSelectedEventId = useStore((s) => s.setSelectedEventId);
  const setMobileMenuOpen = useStore((s) => s.setMobileMenuOpen);

  useEffect(() => {
    setSelectedSessionId(id);
    if (session) setSelectedEventId(session.eventId);
    if (session === undefined) return;
    if (!session) router.push("/");
  }, [id, session, setSelectedSessionId, setSelectedEventId, router]);

  return (
    <>
      <title>{`QTimer - ${session?.name || "Unknown"}`}</title>
      <SessionNav sessionId={id} />
      <div className="hidden flex-col w-60 bg-bg-elevated md:flex shrink-0">
        <SolveHeader name={session?.name || "Unknown"} />
        <Solves />
      </div>
      <main className="flex flex-col flex-1 shrink min-w-0 overflow-y-auto">
        <div className="md:hidden flex items-center gap-3 px-4 py-2.5 border-b border-border/20 bg-bg-primary">
          <Button type="button"
            onClick={() => setMobileMenuOpen(true)}
            variant="ghost"
            size="icon"
            className="-ml-1 rounded-lg"
            aria-label="Open menu"
          >
            <Menu className="w-4 h-4" />
          </Button>
          <h1 className="text-sm font-bold text-primary flex-1 truncate">
            {session?.name || "Timer"}
          </h1>
        </div>
        <Scramble />
        <div className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
          <Timer />
        </div>
        <div className="flex flex-row items-center justify-between gap-2 px-3 py-2 w-full overflow-x-auto scrollbar-none">
          <StatsPanel side="left" />
          <div className="flex items-center justify-center gap-2">
            {showScrambleImage && <ScramblePreview />}
          </div>
          <StatsPanel side="right" />
        </div>
      </main>
    </>
  );
}
