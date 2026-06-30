"use client";

import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/stores/use";
import { Clock, Stats, User, Gear } from "@/components/icons";

const ITEMS = [
  { href: "/", label: "Timer", Icon: Clock },
  { href: "/stats", label: "Stats", Icon: Stats },
  { href: "/social", label: "Social", Icon: User },
  { href: null as string | null, label: "Settings", Icon: Gear },
] as const;

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useStore((s) => s.user);
  const setSettingsOpen = useStore((s) => s.setSettingsOpen);
  const profileActive = pathname === "/profile" || pathname.startsWith("/profile/");

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 flex items-center justify-around px-2 py-2 bg-bg-elevated border-t border-border/10" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.5rem)" }}>
      {ITEMS.map(({ href, label, Icon }) => {
        const isSettings = href === null;
        const active = isSettings
          ? false
          : href === "/"
            ? pathname === "/" || pathname.startsWith("/session/")
            : pathname === href;
        return (
          <button type="button"
            key={label}
            aria-label={label}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 transition-colors border-none bg-transparent cursor-pointer ${
              active ? "text-accent" : "text-muted/50 hover:text-primary"
            }`}
            onClick={() => {
              if (isSettings) {
                setSettingsOpen(true);
              } else {
                router.push(href);
              }
            }}
          >
            <Icon className="size-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        );
      })}

      <button type="button"
        aria-label="Profile"
        className={`flex flex-col items-center gap-0.5 px-4 py-1 transition-colors border-none bg-transparent cursor-pointer ${
          profileActive ? "text-accent" : "text-muted/50 hover:text-primary"
        }`}
        onClick={() => router.push("/profile")}
      >
        {user ? (
          <div className="size-5 rounded-md bg-accent/15 flex items-center justify-center overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="size-full object-cover" />
            ) : (
              <span className="text-[9px] font-bold text-accent">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        ) : (
          <User className="size-5" />
        )}
        <span className="text-[10px] font-medium truncate max-w-12">
          {user ? user.name : "Sign in"}
        </span>
      </button>
    </nav>
  );
}
