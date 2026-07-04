"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => (
    <label
      className={cn(
        "relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        className,
      )}
    >
      <input
        ref={ref}
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        {...props}
      />
      <span
        className={cn(
          "block h-5 w-9 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-input",
        )}
      />
      <span
        className={cn(
          "absolute left-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform",
          checked ? "translate-x-4" : "translate-x-0",
        )}
      />
    </label>
  ),
);
Switch.displayName = "Switch";

export { Switch };
