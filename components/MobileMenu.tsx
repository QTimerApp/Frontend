"use client";

import { useCallback } from "react";
import { useStore } from "@/lib/stores/use";
import { Button } from "@/components/ui/Button";
import { Sidebar } from "@/features/sessions/Sidebar";
import { X } from "@/components/icons";

export function MobileMenu() {
  const open = useStore((s) => s.mobileMenuOpen);
  const setOpen = useStore((s) => s.setMobileMenuOpen);
  const close = useCallback(() => setOpen(false), [setOpen]);

  return (
    <>
      {open && (
        <>
          <button type="button" aria-hidden="true" tabIndex={-1} className="md:hidden fixed inset-0 z-30 bg-black/40 border-none" onClick={close} />
          <div className="md:hidden fixed left-0 top-0 bottom-0 z-40 flex flex-col" style={{ width: 208 }}>
            <div className="flex items-center justify-between px-3 py-2.5 bg-bg-primary border-b border-border/20">
              <span className="text-xs font-bold text-primary">Sessions</span>
              <Button
                onClick={close}
                variant="ghost"
                size="icon"
                className="rounded-lg"
                aria-label="Close menu"
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <Sidebar />
            </div>
          </div>
        </>
      )}
    </>
  );
}
