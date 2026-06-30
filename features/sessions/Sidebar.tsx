"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useMemo, useRef, useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useModal, ModalType, DeleteTarget } from "@/lib/contexts/Modal";
import { PUZZLE_TYPES } from "./puzzle-types";
import { useStore } from "@/lib/stores/use";
import { motion, AnimatePresence } from "framer-motion";
import { sessionService } from "@/lib/services/session";
import { solveRepository } from "@/lib/repositories/solve";
import { Loading } from "@/components/ui/Loading";
import { Plus, Dots, Clock, Stats, User, Gear, ChevronDown, Edit, Minus, Trash } from "@/components/icons";
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/ContextMenu";
import type { DBSession } from "@/types/db";

function SessionRow(
  { session, dragOverId, onDragStart, onDragEnd, onDragOver, onDrop }:
  & { session: DBSession
    ; dragOverId: string | null
    }
  & { onDragStart?: (e: React.DragEvent, id: string) => void
    ; onDragEnd?: (e: React.DragEvent) => void
    ; onDragOver?: (e: React.DragEvent, id: string) => void
    ; onDrop?: (e: React.DragEvent, id: string, eventId: string) => void
    }
) {
  const isDragOver = dragOverId === session.id;
  const pathname = usePathname();
  const router = useRouter();
  const { openModal } = useModal();
  const active = pathname === `/session/${session.id}`;
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const btnRef = useRef<HTMLSpanElement>(null);

  function toggleMenu(e: React.MouseEvent) {
    e.stopPropagation();
    if (menuOpen) {
      setMenuOpen(false);
    } else {
      const rect = btnRef.current!.getBoundingClientRect();
      setMenuPos({ x: rect.left, y: rect.bottom });
      setMenuOpen(true);
    }
  }

  const handleClearSolves = useCallback(async () => {
    await solveRepository.deleteBySession(session.id);
    setMenuOpen(false);
  }, [session.id]);

  return (
    <>
      <div className="relative">
        {isDragOver && (
          <div className="absolute -top-px left-2 right-2 h-0.5 rounded-full bg-accent z-10" />
        )}
        <div
          draggable
          onDragStart={(e) => onDragStart?.(e, session.id)}
          onDragEnd={onDragEnd}
          onDragOver={(e) => onDragOver?.(e, session.id)}
          onDrop={(e) => onDrop?.(e, session.id, session.eventId)}
          className="cursor-grab active:cursor-grabbing"
        >
          <motion.button type="button"
          layout
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.12 }}
          className={`relative pl-7 pr-1 py-1 rounded-md cursor-pointer text-sm transition-colors overflow-hidden group w-full text-left ${
            active
              ? "text-accent font-medium"
              : "text-secondary hover:text-primary"
          }`}
          onClick={() => router.push(`/session/${session.id}`)}
          onContextMenu={(e) => {
            e.preventDefault();
            setMenuPos({ x: e.clientX, y: e.clientY });
            setMenuOpen(true);
          }}
        >
          {active && (
            <div className="absolute inset-y-1 left-1 w-0.5 rounded-full bg-accent" />
          )}
          <div
            className={`absolute inset-0 rounded-md pointer-events-none ${
              active ? "bg-linear-to-r from-accent/[0.07] to-transparent" : ""
            }`}
          />
          <div className="relative flex items-center gap-1">
            <span className="flex-1 truncate">{session.name}</span>
            <span
              ref={btnRef}
              onClick={(e) => { e.stopPropagation(); toggleMenu(e); }}
              className="shrink-0 size-5 flex items-center justify-center rounded text-muted opacity-0 group-hover:opacity-100 hover:text-primary hover:bg-bg-hover/40 transition-all cursor-pointer"
            >
              <Dots className="size-3.5" />
            </span>
          </div>
            </motion.button>
          </div>
        </div>

      <ContextMenu open={menuOpen} onClose={() => setMenuOpen(false)} position={menuPos}>
        <ContextMenuItem
          icon={<Edit className="size-3.5" />}
          onSelect={() => {
            openModal(ModalType.EditSession, {
              sessionId: session.id,
              sessionName: session.name,
              sessionEventId: session.eventId,
            });
            setMenuOpen(false);
          }}
        >
          Rename
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          icon={<Minus className="size-3.5" />}
          onSelect={handleClearSolves}
        >
          Clear Solves
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          danger
          icon={<Trash className="size-3.5" />}
          onSelect={() => {
            openModal(ModalType.Delete, {
              deleteTarget: DeleteTarget.Session,
              sessionName: session.name,
              handleDeleteSession: async () => {
                try {
                  await sessionService.deleteSession(session.id);
                  if (pathname === `/session/${session.id}`) router.push("/");
                } catch (e) {
                  console.error("Failed to delete session", e);
                }
              },
            });
            setMenuOpen(false);
          }}
        >
          Delete
        </ContextMenuItem>
      </ContextMenu>
    </>
  );
}

function Sidebar() {
  const sessions = useLiveQuery(() => db.sessions.toArray());
  const expandedCats = useStore((s) => s.expandedCats);
  const toggleExpandedCat = useStore((s) => s.toggleExpandedCat);
  const { openModal } = useModal();
  const setSettingsOpen = useStore((s) => s.setSettingsOpen);
  const pathname = usePathname();
  const router = useRouter();
  const dragIdRef = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const groups = useMemo(() => {
    if (!sessions) return [];
    const map = new Map<string, DBSession[]>();
    for (const s of sessions) {
      if (!map.has(s.eventId)) map.set(s.eventId, []);
      map.get(s.eventId)!.push(s);
    }
    const order = Object.fromEntries(PUZZLE_TYPES.map((t, i) => [t.name, i]));
    return Array.from(map.entries())
      .sort(([a], [b]) => (order[a] ?? Infinity) - (order[b] ?? Infinity))
      .map(([eventId, sessions]) => ({
        eventId,
        sessions: sessions.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name)),
      }));
  }, [sessions]);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    dragIdRef.current = id;
    setDragOverId(null);
    e.dataTransfer.effectAllowed = "move";
    (e.currentTarget as HTMLElement).style.opacity = "0.4";
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setDragOverId(null);
    (e.currentTarget as HTMLElement).style.opacity = "";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverId(id);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, targetId: string, eventId: string) => {
      e.preventDefault();
      const sourceId = dragIdRef.current;
      if (!sourceId || sourceId === targetId) return;

      const group = groups.find((g) => g.eventId === eventId);
      if (!group) return;

      const ids = group.sessions.map((s) => s.id);
      const fromIdx = ids.indexOf(sourceId);
      const toIdx = ids.indexOf(targetId);
      if (fromIdx === -1 || toIdx === -1) return;

      ids.splice(fromIdx, 1);
      ids.splice(toIdx, 0, sourceId);

      await sessionService.reorderSessions(ids);
      setDragOverId(null);
    },
    [groups],
  );

  return (
    <div className="overflow-y-auto p-2 bg-bg-primary flex flex-col h-full" style={{ width: 208 }}>
      {sessions === undefined && <Loading variant="skeleton" lines={4} />}

      {sessions && sessions.length === 0 && (
        <div className="flex items-center justify-center py-4">
          <span className="text-xs text-muted">No sessions yet</span>
        </div>
      )}

      {groups.map(({ eventId, sessions }, i) => {
        const type = PUZZLE_TYPES.find((t) => t.name === eventId);
        const isCollapsed = !expandedCats.includes(eventId);

        return (
          <div key={eventId}>
            {i > 0 && <div className="h-px bg-border/20 mx-2 my-1.5" />}
            <motion.button type="button"
              layout
              aria-expanded={!isCollapsed}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer hover:bg-bg-hover/40 transition-colors select-none group w-full text-left bg-transparent border-none"
              onClick={() => toggleExpandedCat(eventId)}
            >
              <motion.div
                animate={{ rotate: isCollapsed ? -90 : 0 }}
                transition={{ duration: 0.15 }}
                className="size-2.5 text-muted shrink-0"
              >
                <ChevronDown className="size-2.5" />
              </motion.div>
              <div className="size-3.5 flex items-center justify-center">
                {type && <type.icon />}
              </div>
              <span className="text-xs font-medium text-secondary">{eventId}</span>
            </motion.button>

            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  key={eventId}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="mt-0.5 space-y-0.5 overflow-hidden"
                >
                  {sessions.map((s) => (
                    <SessionRow
                      key={s.id}
                      session={s}
                      dragOverId={dragOverId}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      <motion.button type="button"
        layout
        aria-label="Add new session"
        className="flex items-center gap-1.5 px-2 py-1.5 mt-1 rounded-md cursor-pointer text-xs text-muted hover:text-primary hover:bg-bg-hover/40 transition-colors w-full text-left bg-transparent border-none"
        onClick={() => openModal(ModalType.AddSession)}
        whileTap={{ scale: 0.97 }}
      >
        <Plus className="size-3.5 shrink-0" />
        <span>Add Session</span>
      </motion.button>

      <div className="mt-auto pt-3 border-t border-border/40 space-y-0.5">
        {[
          { href: "/", label: "Timer", Icon: Clock },
          { href: "/stats", label: "Stats", Icon: Stats },
          { href: "/social", label: "Social", Icon: User },
          { href: "/settings", label: "Settings", Icon: Gear },
        ].map((item) => {
          const isSettings = item.label === "Settings";
          const active = isSettings
            ? false
            : item.href === "/"
              ? pathname === "/" || pathname.startsWith("/session/")
              : pathname === item.href;
          return (
            <div key={item.href} className="relative">
              {active && (
                <motion.div
                  layoutId="sidebar-nav-bg"
                  className="absolute inset-0 rounded-md bg-accent/[0.07]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <motion.button type="button"
                aria-label={item.label}
                className={`relative px-2 py-1.5 rounded-md cursor-pointer text-xs transition-colors w-full text-left bg-transparent border-none ${
                  active
                    ? "text-accent font-medium"
                    : "text-muted hover:text-primary hover:bg-bg-hover/40"
                }`}
                onClick={() => {
                  if (isSettings) {
                    setSettingsOpen(true);
                  } else {
                    router.push(item.href);
                  }
                }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="flex items-center gap-1.5">
                  <item.Icon className="size-3.5 shrink-0" />
                  <span>{item.label}</span>
                </div>
              </motion.button>
            </div>
          );
        })}
      </div>

      <div className="mt-1">
        <NavProfile />
      </div>
    </div>
  );
}

function NavProfile() {
  const user = useStore((s) => s.user);
  const router = useRouter();
  const pathname = usePathname();
  const active = pathname === "/profile";

  return (
    <motion.button type="button"
      layout
      aria-label="Profile"
      className={`px-2 py-1.5 rounded-md cursor-pointer text-xs transition-colors w-full text-left bg-transparent border-none ${
        active
          ? "text-accent font-medium bg-accent/[0.07]"
          : "text-muted hover:text-primary hover:bg-bg-hover/40"
      }`}
      onClick={() => router.push("/profile")}
      whileTap={{ scale: 0.97 }}
    >
      <div className="flex items-center gap-2">
        {user ? (
          <>
            <div className="size-6 rounded-lg bg-accent/15 flex items-center justify-center shrink-0 overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="size-full object-cover" />
              ) : (
                <span className="text-[11px] font-bold text-accent">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <span className="truncate text-primary font-medium">{user.name}</span>
          </>
        ) : (
          <>
            <User className="size-3.5 shrink-0" />
            <span>Sign in</span>
          </>
        )}
      </div>
    </motion.button>
  );
}

export { Sidebar };
