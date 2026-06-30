"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/stores/use";
import { Toggle } from "@/components/ui/Toggle";
import { SettingRow } from "@/features/settings/Row";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { UserProfile } from "@/types/user";
import { BackArrow, User, Layers, Gear } from "@/components/icons";

const ALL_EVENTS = [
  "2×2", "3×3", "4×4", "5×5", "6×6", "7×7",
  "Megaminx", "Pyraminx", "Skewb", "Clock", "Square One",
];

const SECTION_ICONS: Record<string, React.ReactNode> = {
  about: <User className="size-3.5 text-accent" />,
  events: <Layers className="size-3.5 text-accent" />,
  wca: <Gear className="size-3.5 text-accent" />,
  preferences: <Gear className="size-3.5 text-accent" />,
};

export default function ProfileSettings() {
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const router = useRouter();
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [pronouns, setPronouns] = useState(user?.pronouns ?? "");
  const [selectedEvents, setSelectedEvents] = useState<string[]>(user?.events ?? []);
  const [showWca, setShowWca] = useState(user?.showWcaOnProfile !== false);
  const [profileHidden, setProfileHidden] = useState(user?.profileHidden ?? false);
  const [wcaConnected, setWcaConnected] = useState(user?.wcaConnected ?? false);
  const [wcaId, setWcaId] = useState(user?.wcaId ?? "");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!user) router.push("/profile");
  }, [user, router]);

  const markDirty = useCallback(() => {
    if (!dirty) setDirty(true);
  }, [dirty]);

  function toggleEvent(event: string) {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
    markDirty();
  }

  function handleSave() {
    if (!user) return;
    setUser({
      ...user,
      name,
      bio,
      pronouns,
      events: selectedEvents,
      showWcaOnProfile: showWca,
      profileHidden,
      wcaConnected,
      wcaId,
    } as UserProfile);
    setDirty(false);
    toast.success("Profile saved", {
      description: "Your changes have been saved successfully.",
    });
    router.push("/profile");
  }

  function handleDiscard() {
    setName(user?.name ?? "");
    setBio(user?.bio ?? "");
    setPronouns(user?.pronouns ?? "");
    setSelectedEvents(user?.events ?? []);
    setShowWca(user?.showWcaOnProfile !== false);
    setProfileHidden(user?.profileHidden ?? false);
    setWcaConnected(user?.wcaConnected ?? false);
    setWcaId(user?.wcaId ?? "");
    setDirty(false);
  }

  function confirmDiscard() {
    setShowDiscardDialog(false);
    setDirty(false);
    router.push("/profile");
  }

  function handleConnectWca() {
    setWcaConnected(true);
    setWcaId("2022CHEN42");
    markDirty();
  }

  function handleDisconnectWca() {
    setWcaConnected(false);
    setWcaId("");
    setShowWca(false);
    markDirty();
  }

  if (!user) return null;

  return (
    <main className="flex flex-1 min-w-0 overflow-y-auto">
      <title>QTimer - Profile Settings</title>

      <div className="flex-1 max-w-xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <button type="button"
            onClick={() => { if (dirty) setShowDiscardDialog(true); else router.push("/profile"); }}
            className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-bg-elevated/40 transition-colors"
          >
            <BackArrow className="size-4" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-primary">Edit profile</h1>
            <p className="text-xs text-muted-foreground mt-0.5">@{user.username || user.email.split("@")[0]}</p>
          </div>
        </div>

        <div className="space-y-5">
          {}
          <SectionCard icon={SECTION_ICONS.about} title="About">
            <div className="space-y-1">
              <Field label="Name">
                <input
                  value={name}
                  onChange={(e) => { setName(e.target.value); markDirty(); }}
                  className="w-full rounded-lg bg-bg-primary border border-border/30 px-3 py-2 text-sm text-primary placeholder:text-muted/40 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors"
                  placeholder="Your display name"
                />
              </Field>
              <div className="h-px bg-border/10 mx-5" />
              <Field label="Username">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground/60 bg-bg-elevated/40 rounded-lg px-3 py-2 border border-border/20">
                  <span>@{user.username || user.email.split("@")[0]}</span>
                  <span className="text-[10px] text-muted-foreground/40 ml-auto">Cannot be changed</span>
                </div>
              </Field>
              <div className="h-px bg-border/10 mx-5" />
              <Field label="Bio">
                <div className="relative">
                  <textarea
                    value={bio}
                    onChange={(e) => { setBio(e.target.value); markDirty(); }}
                    rows={4}
                    className="w-full resize-none rounded-lg bg-bg-primary border border-border/30 px-3 py-2 text-sm text-primary placeholder:text-muted/40 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors"
                    placeholder="Tell the community about yourself..."
                  />
                  <span className="absolute bottom-3 right-3 text-[10px] text-muted-foreground/50">{bio.length}/280</span>
                </div>
              </Field>
              <div className="h-px bg-border/10 mx-5" />
              <Field label="Pronouns">
                <input
                  value={pronouns}
                  onChange={(e) => { setPronouns(e.target.value); markDirty(); }}
                  className="w-full rounded-lg bg-bg-primary border border-border/30 px-3 py-2 text-sm text-primary placeholder:text-muted/40 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors"
                  placeholder="e.g. she/her, he/him, they/them"
                />
              </Field>
            </div>
          </SectionCard>

          {}
          <SectionCard icon={SECTION_ICONS.events} title="Events" subtitle="Select the puzzles you compete in">
            <div className="px-4 sm:px-5 pb-5 pt-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {ALL_EVENTS.map((event) => {
                  const active = selectedEvents.includes(event);
                  return (
                    <button type="button"
                      key={event}
                      onClick={() => toggleEvent(event)}
                      className={`flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-lg text-[11px] sm:text-xs font-semibold border transition-all ${
                        active
                          ? "bg-accent/10 text-accent border-accent/20"
                          : "bg-transparent text-muted-foreground/50 border-border/15 hover:border-border/30 hover:text-muted-foreground"
                      }`}
                    >
                      <div className={`size-1.5 rounded-full shrink-0 ${active ? "bg-accent" : "bg-border/30"}`} />
                      {event}
                    </button>
                  );
                })}
              </div>
            </div>
          </SectionCard>

          {}
          <SectionCard icon={SECTION_ICONS.wca} title="Connected Accounts">
            <div className="px-5 pb-3">
              <div className="flex items-center gap-3 rounded-lg p-3">
                <div className="size-8 shrink-0">
                  <img src="/wca.svg" alt="WCA" className="size-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary">WCA</p>
                  {wcaConnected ? (
                    <p className="text-xs text-muted-foreground/60 truncate">
                      {wcaId}
                      {" · "}
                      <a
                        href={`https://worldcubeassociation.org/persons/${wcaId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:text-accent/80 transition-colors"
                      >
                        View profile
                      </a>
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground/60">Not connected</p>
                  )}
                </div>
                {wcaConnected ? (
                  <button type="button"
                    onClick={handleDisconnectWca}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground border border-border/30 hover:border-destructive/50 hover:text-destructive transition-colors"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button type="button"
                    onClick={handleConnectWca}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-accent border border-accent/30 hover:bg-accent/10 transition-colors"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          </SectionCard>

          {}
          <SectionCard icon={SECTION_ICONS.preferences} title="Preferences">
            <SettingRow label="Show WCA badge" description="Display your verified WCA checkmark and ID on your profile">
              <Toggle
                value={showWca}
                onChange={(v) => { setShowWca(v); markDirty(); }}
                id="show-wca-profile"
                disabled={!wcaConnected}
              />
            </SettingRow>
            <div className="h-px bg-border/10 mx-4" />
            <SettingRow label="Hide my profile" description="When enabled, your profile won't be visible to other users">
              <Toggle
                value={profileHidden}
                onChange={(v) => { setProfileHidden(v); markDirty(); }}
                id="hide-profile"
              />
            </SettingRow>
          </SectionCard>

          <div className="h-0 sm:h-20" />

          <AnimatePresence>
            {dirty && (
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="sm:fixed sm:bottom-5 sm:inset-x-0 z-40 flex justify-center sm:pointer-events-none sticky bottom-0 -mx-4 sm:mx-0"
              >
                <div className="w-full sm:max-w-xl py-3 px-4 sm:px-6 bg-bg-primary/95 backdrop-blur border-t sm:border-t-0 sm:border border-border/10 flex items-center justify-between sm:rounded-2xl shadow-xl">
                  <p className="text-xs text-muted-foreground/60 hidden sm:block">You have unsaved changes</p>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    <button type="button"
                      onClick={handleDiscard}
                      className="px-4 py-1.5 rounded text-sm font-medium text-muted-foreground hover:text-primary hover:bg-bg-elevated/40 transition-colors active:scale-[0.97]"
                    >
                      Reset
                    </button>
                    <button type="button"
                      onClick={handleSave}
                      className="px-5 py-1.5 rounded text-sm font-semibold bg-accent text-[var(--accent-text)] hover:bg-accent/90 transition-all active:scale-[0.97]"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {}
      <AnimatePresence>
        {showDiscardDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          >
            <button type="button" aria-hidden="true" tabIndex={-1} className="absolute inset-0 bg-black/40 border-none" onClick={() => setShowDiscardDialog(false)} />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-bg-surface border border-border/30 rounded-2xl shadow-2xl max-w-sm w-full sm:mx-4 p-6"
            >
              <h2 className="text-base font-bold text-primary">Discard changes?</h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                You have unsaved changes to your profile. Are you sure you want to discard them?
              </p>
              <div className="flex items-center justify-end gap-2 mt-5">
                <button type="button"
                  onClick={() => setShowDiscardDialog(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-bg-elevated/40 transition-colors"
                >
                  Keep editing
                </button>
                <button type="button"
                  onClick={confirmDiscard}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                >
                  Discard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}



function SectionCard({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/20 bg-bg-elevated/20 overflow-hidden">
      <div className="px-4 sm:px-5 pt-4 pb-2 flex items-center gap-2.5">
        <div className="size-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground/60 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-4 sm:px-5 py-3">
      <label className="text-xs text-muted-foreground font-medium block mb-1.5">{label}</label>
      {children}
    </div>
  );
}
