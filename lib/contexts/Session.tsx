"use client";

import { createContext, useContext, type ReactNode } from "react";
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

export function SessionProvider({ sessionId, children }: { sessionId: string; children: ReactNode }) {
  const session = useLiveQuery(
    () => db.sessions.get(sessionId).then((r) => r ?? null),
    [sessionId],
  );
  const solves = useLiveQuery(
    () => db.solves.where("sessionId").equals(sessionId).sortBy("createdAt"),
    [sessionId],
    [],
  );

  return (
    <SessionContext.Provider value={{ session, solves, loading: session === undefined }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
