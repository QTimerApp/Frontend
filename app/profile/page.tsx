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
        <title>QTimer - Sign In</title>
        <div className="flex flex-col items-center justify-center flex-1 gap-6 px-6">
          <div className="size-16 rounded-2xl bg-[#5865F2]/10 flex items-center justify-center">
            <img src="/discord.svg" alt="" className="size-8" />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-xl font-black text-primary">Welcome to QTimer</h1>
            <p className="text-sm text-muted max-w-xs">
              Sign in with Discord to sync your solves across devices and access social features.
            </p>
          </div>
          <button type="button"
            onClick={() => setUser(demoUser())}
            className="flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-bold bg-[#5865F2] text-white hover:bg-[#4752C4] transition-all active:scale-[0.97]"
          >
            <svg viewBox="0 -28.5 256 256" className="size-5 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z"/>
            </svg>
            Sign in with Discord
          </button>
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
