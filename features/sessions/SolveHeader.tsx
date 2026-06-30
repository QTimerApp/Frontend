"use client";

import { useSession } from "@/lib/contexts/Session";

export type SolveHeaderProps = {
  name: string;
};

function SolveHeader({ name }: SolveHeaderProps) {
  const { session } = useSession();

  return (
    <div className="flex items-center justify-center px-4 h-12 font-title text-sm font-semibold text-primary shadow-sm">
      {session?.name || name}
    </div>
  );
}

export { SolveHeader };
