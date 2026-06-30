"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { DBSession, DBSolve } from "@/types/db";

interface SessionContextValue {
  session: DBSession | null | undefined;
  solves: DBSolve[];
  loading: boolean;
}

const SessionContext = createContext<SessionContextValue>({
  session: undefined,
  solves: [],
  loading: true,
});

function dedupeSolves(a: DBSolve[], b: DBSolve[]): DBSolve[] {
  if (!b || b.length === 0) return a;
  if (a.length === 0) return b;
  if (a.length === b.length && a[a.length - 1]?.id === b[b.length - 1]?.id) return a;
  return b;
}

export function SessionProvider({ sessionId, children }: { sessionId: string; children: ReactNode }) {
  const session = useLiveQuery(
    () => db.sessions.get(sessionId).then((r) => r ?? null),
    [sessionId],
  );
  const rawSolves = useLiveQuery(
    () => db.solves.where("sessionId").equals(sessionId).sortBy("createdAt"),
    [sessionId],
    [],
  );

  const solves = useMemo(() => dedupeSolves(rawSolves, rawSolves), [rawSolves]);

  const value = useMemo(
    () => ({ session, solves, loading: session === undefined }),
    [session, solves],
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
