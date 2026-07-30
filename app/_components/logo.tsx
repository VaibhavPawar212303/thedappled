"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo = ({ className, showText = true }: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* The Icon */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-foreground" // Controls the icon color, theme-aware
      >
        {/* The Stem */}
        <rect x="2" y="2" width="8" height="28" rx="2" fill="currentColor" />
        
        {/* The Top Bar */}
        <rect x="12" y="2" width="10" height="8" rx="2" fill="currentColor" />
        
        {/* The Bottom Bar */}
        <rect x="12" y="22" width="10" height="8" rx="2" fill="currentColor" />
        
        {/* The Curve (Pixelated/Dappled effect) — brand accent, fixed across themes */}
        <rect x="24" y="6" width="6" height="8" rx="2" fill="#3987e5" />
        <rect x="24" y="18" width="6" height="8" rx="2" fill="#3987e5" />
      </svg>

      {/* The Text */}
      {showText && (
        <span className="font-bold text-xl tracking-tight text-foreground">
          Thedappled
          <sup className="text-xs font-normal ml-0.5">&trade;</sup>
        </span>
      )}
    </div>
  );
};