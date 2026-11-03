"use client";

import { ReactNode } from "react";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  className?: string;
  side?: "top" | "bottom";
}

/** 호버/포커스 시 나타나는 가벼운 CSS 툴팁 */
export default function Tooltip({ content, children, className = "", side = "top" }: TooltipProps) {
  if (!content) return <>{children}</>;
  return (
    <span className={`group/tip relative inline-flex ${className}`} tabIndex={0}>
      {children}
      <span
        role="tooltip"
        className={`tooltip-box left-1/2 -translate-x-1/2 opacity-0 transition-all duration-150 group-hover/tip:opacity-100 group-focus-visible/tip:opacity-100 ${
          side === "top" ? "bottom-full mb-2 translate-y-1 group-hover/tip:translate-y-0" : "top-full mt-2 -translate-y-1 group-hover/tip:translate-y-0"
        }`}
      >
        {content}
      </span>
    </span>
  );
}
