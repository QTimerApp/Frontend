import { type ButtonHTMLAttributes, forwardRef } from "react";
import { Spinner } from "@/components/icons";

type Variant = "primary" | "secondary" | "danger" | "danger-ghost" | "ghost";
type Size = "sm" | "md" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const base =
  "inline-flex items-center justify-center rounded-lg text-xs font-medium transition-all active:scale-[0.97] disabled:opacity-30 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-[var(--accent-text)] font-bold hover:bg-accent/90",
  secondary:
    "text-secondary hover:text-primary hover:bg-bg-hover/60",
  danger:
    "bg-red-500 text-white font-bold hover:bg-red-600",
  "danger-ghost":
    "text-red-400 hover:text-red-300 hover:bg-red-500/10",
  ghost:
    "text-muted hover:text-primary hover:bg-bg-hover/40",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5",
  md: "px-4 py-2",
  icon: "size-7 flex items-center justify-center",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "secondary", size = "md", loading, children, className, disabled, ...props }, ref) => (
    <button
      type="button"
      ref={ref}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className ?? ""}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-1.5">
          <Spinner className="size-3.5" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  ),
);

Button.displayName = "Button";
