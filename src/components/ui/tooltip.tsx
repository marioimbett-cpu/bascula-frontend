"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/utils/cn";

/**
 * Tooltip accesible: se muestra en hover y en focus (teclado), con role="tooltip"
 * y aria-describedby enlazado dinámicamente.
 */
export function Tooltip({ content, children, className }: { content: string; children: ReactNode; className?: string }) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      <span aria-describedby={visible ? id : undefined}>{children}</span>
      {visible && (
        <span
          role="tooltip"
          id={id}
          className={cn(
            "absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background shadow-popover",
            className
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
