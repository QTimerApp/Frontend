"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Clock, Stats } from "@/components/icons";

const TABS = [
  { href: "", label: "Timer", Icon: Clock },
  { href: "/stats", label: "Stats", Icon: Stats },
  { href: "/solves", label: "Solves", Icon: null },
];

const MOBILE_ONLY = new Set(["/solves"]);

export function SessionNav({ sessionId }: { sessionId: string }) {
  const pathname = usePathname();

  return (
    <div className="fixed right-2 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-0.5 bg-bg-elevated/70 backdrop-blur-sm rounded-lg p-1 border border-border/20">
      {TABS.map((tab) => {
        const href = `/session/${sessionId}${tab.href}`;
        const active = pathname === href;
        return (
          <Link
            key={tab.href}
            href={href}
            className={`group relative flex items-center justify-center size-8 rounded-md transition-colors ${
              MOBILE_ONLY.has(tab.href) ? "md:hidden" : ""
            }`}
            aria-label={tab.label}
          >
            <div
              className={`absolute inset-0 rounded-md transition-colors ${
                active ? "" : "hover:bg-accent/10"
              }`}
            />
            {active && (
              <motion.div
                layoutId="sess-nav-bg"
                className="absolute inset-0 rounded-md bg-accent/40"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {tab.Icon ? (
              <tab.Icon
                className="relative size-4"
                strokeWidth={1.5}
                style={{ color: active ? "white" : "var(--text-secondary)" }}
              />
            ) : (
              <svg
                className="relative size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: active ? "white" : "var(--text-secondary)" }}
              >
                <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" />
              </svg>
            )}
            <div
              className="absolute right-full mr-2 px-2 py-1 rounded-md text-xs whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 pointer-events-none"
              style={{
                backgroundColor: "var(--bg-elevated)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
              }}
            >
              {tab.label}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
