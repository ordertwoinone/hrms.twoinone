import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * `cn` merges conditional class names (clsx) and de-duplicates conflicting
 * Tailwind utilities (tailwind-merge). This is the single class-name helper
 * used by every component in the design system.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
