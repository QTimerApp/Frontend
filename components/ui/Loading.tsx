"use client";

interface LoadingProps {
  variant?: "page" | "card" | "skeleton";
  lines?: number;
}

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-lg bg-bg-elevated/60 overflow-hidden ${className ?? ""}`}
      style={{
        maskImage: `linear-gradient(90deg, transparent, #000 20%, #000 80%, transparent)`,
        WebkitMaskImage: `linear-gradient(90deg, transparent, #000 20%, #000 80%, transparent)`,
      }}
    >
      <div
        className="h-full w-full"
        style={{
          background: `linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--accent) 15%, transparent) 50%, transparent 100%)`,
          backgroundSize: "200% 100%",
          animation: `shimmer 1.8s ease-in-out infinite`,
        }}
      />
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="space-y-3 p-5">
      <div className="flex items-center gap-3">
        <SkeletonBar className="size-8 rounded-xl shrink-0" />
        <div className="space-y-2 flex-1">
          <SkeletonBar className="h-3.5 w-2/5" />
          <SkeletonBar className="h-3 w-1/3" />
        </div>
      </div>
      <SkeletonBar className="h-3 w-full" />
      <SkeletonBar className="h-3 w-4/5" />
      <div className="flex gap-2 pt-1">
        <SkeletonBar className="h-8 w-20 rounded-lg" />
        <SkeletonBar className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 p-8">
      <svg className="size-10 text-accent/30 animate-pulse" viewBox="0 0 24 24" fill="none" aria-hidden={true}>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4 31.4" strokeLinecap="round" className="opacity-40">
          <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1.2s" repeatCount="indefinite" />
        </circle>
      </svg>
      <div className="space-y-2 w-40">
        <SkeletonBar className="h-2.5 w-3/4 mx-auto" />
        <SkeletonBar className="h-2 w-full" />
      </div>
    </div>
  );
}

export function Loading({ variant = "card", lines }: LoadingProps) {
  if (variant === "page") return <PageSkeleton />;

  if (variant === "skeleton") {
    const count = lines ?? 3;
    return (
      <div className="space-y-2.5 p-5">
        {Array.from({ length: count }, (_, i) => (
          <SkeletonBar key={i} className={`h-3 ${i === 0 ? "w-4/5" : i === count - 1 ? "w-3/5" : "w-full"}`} />
        ))}
      </div>
    );
  }

  return <CardSkeleton />;
}
