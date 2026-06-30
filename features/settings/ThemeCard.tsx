import { memo } from "react";
import type { ThemeDefinition, ThemeCategory } from "@/types/themes";
import { X, Edit } from "@/components/icons";

const CATEGORY_LABELS: Record<ThemeCategory, string> = {
  dark: "Dark",
  light: "Light",
  colorful: "Colorful",
  monochrome: "Mono",
  nature: "Nature",
  retro: "Retro",
};

export const ThemeCard = memo(function ThemeCard({
  theme,
  selected,
  onSelect,
  onEdit,
  onDelete,
}: {
  theme: ThemeDefinition;
  selected: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const { colors, accent } = theme;

  return (
    <div
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(); } }}
      role="button"
      tabIndex={0}
      className={`relative rounded-xl border-2 p-0 text-left transition-all overflow-hidden group ${
        selected
          ? "border-accent ring-1 ring-accent/30"
          : "border-border/30 hover:border-border/60"
      }`}
    >
      <div className="h-1.5" style={{ backgroundColor: accent }} />
      <div className="p-3 space-y-2">
        <div
          className="rounded-lg overflow-hidden"
          style={{ borderColor: colors.border, backgroundColor: colors.bgPrimary, borderWidth: 1 }}
        >
          <div className="p-2 space-y-1.5">
            <div className="flex items-center gap-1">
              <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: accent }} />
              <div className="size-3 rounded-sm" style={{ backgroundColor: colors.textPrimary }} />
              <div className="size-3 rounded-sm" style={{ backgroundColor: colors.textSecondary }} />
            </div>
            <div className="flex gap-1">
              <div className="h-2 rounded-sm flex-1" style={{ backgroundColor: colors.bgElevated }} />
              <div className="h-2 w-2 rounded-sm" style={{ backgroundColor: colors.bgSurface }} />
            </div>
            <div className="flex gap-1">
              <div className="h-1.5 rounded-full flex-1" style={{ backgroundColor: colors.bgHover }} />
              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors.bgActive }} />
            </div>
            <div className="h-0.5 rounded-full w-2/3" style={{ backgroundColor: colors.border }} />
          </div>
        </div>
        <div className="flex items-center justify-between gap-1">
          <span className="font-medium text-xs text-primary truncate">{theme.name}</span>
          <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-bg-active text-muted">
            {CATEGORY_LABELS[theme.category]}
          </span>
        </div>
      </div>
      <div
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        {onEdit && (
          <button type="button"
            onClick={() => onEdit()}
            aria-label="Edit theme"
            className="size-5 flex items-center justify-center rounded-full bg-black/40 text-white/70 hover:text-white hover:bg-black/60 transition-colors cursor-pointer border-none"
          >
            <Edit className="size-3" />
          </button>
        )}
        {onDelete && (
          <button type="button"
            onClick={() => onDelete()}
            aria-label="Delete theme"
            className="size-5 flex items-center justify-center rounded-full bg-black/40 text-white/70 hover:text-white hover:bg-black/60 transition-colors cursor-pointer border-none"
          >
            <X className="size-3" />
          </button>
        )}
      </div>
    </div>
  );
});
