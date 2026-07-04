import type { AttendanceStatus } from "./types";

export const ATTENDANCE_STATUSES: { value: AttendanceStatus; label: string }[] = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
  { value: "half_day", label: "Half Day" },
  { value: "on_leave", label: "On Leave" },
  { value: "holiday", label: "Holiday" },
  { value: "weekend", label: "Weekend" },
];

export const STATUS_BADGE: Record<
  AttendanceStatus,
  { label: string; variant: "default" | "primary" | "success" | "warning" | "destructive" | "outline" | "solid" }
> = {
  present:  { label: "Present",  variant: "success" },
  absent:   { label: "Absent",   variant: "destructive" },
  late:     { label: "Late",     variant: "warning" },
  half_day: { label: "Half Day", variant: "outline" },
  on_leave: { label: "On Leave", variant: "primary" },
  holiday:  { label: "Holiday",  variant: "outline" },
  weekend:  { label: "Weekend",  variant: "outline" },
};

export function fmtTime(iso: string | null): string {
  if (!iso) return "—";
  const t = iso.length > 5 ? iso.slice(11, 16) : iso.slice(0, 5);
  const [h, m] = t.split(":").map(Number);
  const period = (h ?? 0) >= 12 ? "PM" : "AM";
  const h12 = (h ?? 0) % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export function fmtDuration(minutes: number): string {
  if (minutes <= 0) return "0h";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
