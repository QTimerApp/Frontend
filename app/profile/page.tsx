"use client";

import { useState } from "react";
import { useStore } from "@/lib/stores/use";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@/types/user";
import { User, Calendar } from "@/components/icons";
import { StatLink } from "@/features/profile/shared";
import { OverviewTab } from "@/features/profile/OverviewTab";
import { ActivityTab } from "@/features/profile/ActivityTab";
import { TimelineTab } from "@/features/profile/TimelineTab";

function demoUser(): UserProfile {
  return {
    name: "Sarah Chen",
    username: "sarah",
    email: "sarah@speedcube.dev",
    avatar: "https://github.com/Cinnamonsroll.png?size=400",
    bio: "Speedcuber since 2019  ·  Sub-10 on 3×3  ·  WR32 in Megaminx\nBuilding QTimer to give back to the community.",
    pronouns: "she/her",
    wcaId: "2022CHEN42",
    wcaConnected: true,
    showWcaOnProfile: true,
    profileHidden: false,
    memberSince: "2022-03-18",
    events: ["3×3", "4×4", "5×5", "Megaminx", "Pyraminx", "Skewb", "Clock"],

    totalSolves: 28472,
    followers: 1853,
    following: 412,
    recentPosts: 27,
  };
}

type Tab = "overview" | "activity" | "timeline";

export default function Profile() {
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");

  if (!user) {
    return (
      <main className="flex flex-1 min-w-0 overflow-y-auto">
        <title>QTimer - Profile</title>
        <div className="flex flex-col items-center justify-center flex-1 gap-4">
          <div className="size-16 rounded-xl bg-bg-elevated flex items-center justify-center ring-1 ring-border/10">
            <User className="size-8 text-muted" />
          </div>
          <h1 className="text-lg font-bold text-primary">Profile</h1>
          <p className="text-sm text-muted max-w-xs text-center">
            Sign in to sync your solves across devices and access social features.
          </p>
          <div className="flex items-center gap-3">
            <button type="button"
              onClick={() => setUser(demoUser())}
              className="px-5 py-2 rounded-full text-sm font-bold bg-accent/10 text-accent ring-1 ring-accent/25 hover:bg-accent/20 hover:ring-accent/40 transition-all active:scale-95"
            >
              Demo Sign In
            </button>
            <span className="text-xs text-muted">(no real auth yet)</span>
          </div>
        </div>
      </main>
    );
  }

  const joinedDate = new Date(user.memberSince).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const showWca = user.wcaConnected && user.wcaId && user.showWcaOnProfile !== false;
  const handle = user.username || user.email.split("@")[0];

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "activity", label: "Activity" },
    { key: "timeline", label: "Timeline" },
  ];

  return (
    <main className="flex flex-1 min-w-0 overflow-y-auto">
      <title>QTimer - Profile</title>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="relative w-full h-44 sm:h-52 shrink-0 overflow-hidden">
          {user.avatar && (
            <img
              src={user.avatar}
              alt=""
              className="absolute inset-0 size-full object-cover scale-150 blur-3xl opacity-60"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-bg-surface via-bg-surface/30 to-transparent" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto w-full px-4 sm:px-6">
          <div className="-mt-12 sm:-mt-16 mb-3">
            <div className="size-20 sm:size-28 rounded-2xl bg-bg-surface flex items-center justify-center overflow-hidden shadow-xl ring-4 ring-bg-surface">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="size-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-accent">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-primary leading-tight">
                {user.name}
              </h1>
              <p className="text-base text-muted-foreground mt-0.5">
                @{handle}
                {user.pronouns && <span className="text-muted-foreground/60">  ({user.pronouns})</span>}
              </p>
            </div>
            <Button type="button"
              onClick={() => router.push("/profile/settings")}
              variant="ghost"
              size="sm"
              className="rounded-md h-8 text-xs shrink-0 mt-1"
            >
              Edit profile
            </Button>
          </div>

          {user.bio && (
            <p className="text-sm text-primary/90 mt-3 max-w-xl leading-relaxed whitespace-pre-line">{user.bio}</p>
          )}

          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" />
              Joined {joinedDate}
            </span>
            {user.wcaConnected ? (
              <a
                href={`https://worldcubeassociation.org/persons/${user.wcaId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 group"
              >
                <span className={`size-4 rounded ${showWca ? "ring-1 ring-emerald-500/30" : "opacity-50"} overflow-hidden shrink-0`}>
                  <img src="/wca.svg" alt="" className="size-full" />
                </span>
                <span className={`text-xs font-medium ${showWca ? "text-emerald-500 group-hover:text-emerald-400" : "text-muted-foreground/50"} transition-colors`}>
                  {user.wcaId}
                </span>
              </a>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-4 pb-5 border-b border-border/20">
            <StatLink value={user.totalSolves} label="Solves" />
            <StatLink value={user.events?.length ?? 0} label="Events" />
            <StatLink value={user.followers} label="Followers" />
            <StatLink value={user.following} label="Following" />
          </div>
        </div>

          <div className="border-b border-border/20">
          <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 flex gap-6">
            {tabs.map((t) => (
              <button type="button"
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative pb-2.5 text-sm font-medium transition-colors ${
                  tab === t.key ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`}
              >
                {t.label}
                {tab === t.key && (
                  <motion.div
                    layoutId="profile-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-accent"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-7">
          <AnimatePresence mode="wait">
            {tab === "overview" && <OverviewTab key="overview" user={user} />}
            {tab === "activity" && <ActivityTab key="activity" />}
            {tab === "timeline" && <TimelineTab key="timeline" />}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
