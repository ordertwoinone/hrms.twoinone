import type { BadgeProps } from "@/components/ui/badge";
import type { LetterStatus } from "./types";

export const LETTER_TYPES = [
  "Salary Certificate",
  "Salary Transfer Letter",
  "No Objection Certificate (NOC)",
  "Experience Letter",
  "Employment Verification Letter",
  "Bank Account Opening Letter",
  "Other",
] as const;

export const LETTER_STATUSES: Record<
  LetterStatus,
  { label: string; variant: NonNullable<BadgeProps["variant"]> }
> = {
  pending: { label: "Pending", variant: "warning" },
  processing: { label: "Processing", variant: "primary" },
  ready: { label: "Ready", variant: "success" },
  rejected: { label: "Rejected", variant: "destructive" },
};

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Minutes → "7h 30m". */
export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
