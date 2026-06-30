import { type SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

export function Minus({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden={true} {...props}>
      <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
    </svg>
  );
}
