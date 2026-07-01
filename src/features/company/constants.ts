/**
 * Company module option lists. Weekday values follow JS `Date.getDay()`
 * (0 = Sunday … 6 = Saturday). `working_days` stores the working weekday values;
 * the remainder are the weekend.
 */
export const WEEKDAYS: { value: number; short: string; label: string }[] = [
  { value: 0, short: "Sun", label: "Sunday" },
  { value: 1, short: "Mon", label: "Monday" },
  { value: 2, short: "Tue", label: "Tuesday" },
  { value: 3, short: "Wed", label: "Wednesday" },
  { value: 4, short: "Thu", label: "Thursday" },
  { value: 5, short: "Fri", label: "Friday" },
  { value: 6, short: "Sat", label: "Saturday" },
];

export const TIMEZONES: { value: string; label: string }[] = [
  { value: "Asia/Dubai", label: "Asia/Dubai (GST, UTC+4)" },
  { value: "Asia/Riyadh", label: "Asia/Riyadh (AST, UTC+3)" },
  { value: "Asia/Qatar", label: "Asia/Qatar (UTC+3)" },
  { value: "Asia/Kuwait", label: "Asia/Kuwait (UTC+3)" },
  { value: "Asia/Bahrain", label: "Asia/Bahrain (UTC+3)" },
  { value: "Asia/Muscat", label: "Asia/Muscat (UTC+4)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST, UTC+5:30)" },
  { value: "Asia/Karachi", label: "Asia/Karachi (PKT, UTC+5)" },
  { value: "Asia/Manila", label: "Asia/Manila (UTC+8)" },
  { value: "Europe/London", label: "Europe/London (UTC+0/+1)" },
  { value: "America/New_York", label: "America/New_York (UTC-5/-4)" },
];

export const CURRENCIES: { value: string; label: string }[] = [
  { value: "AED", label: "AED — UAE Dirham" },
  { value: "SAR", label: "SAR — Saudi Riyal" },
  { value: "QAR", label: "QAR — Qatari Riyal" },
  { value: "KWD", label: "KWD — Kuwaiti Dinar" },
  { value: "BHD", label: "BHD — Bahraini Dinar" },
  { value: "OMR", label: "OMR — Omani Rial" },
  { value: "USD", label: "USD — US Dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — British Pound" },
  { value: "INR", label: "INR — Indian Rupee" },
];

export const COUNTRIES: { value: string; label: string }[] = [
  { value: "United Arab Emirates", label: "United Arab Emirates" },
  { value: "Saudi Arabia", label: "Saudi Arabia" },
  { value: "Qatar", label: "Qatar" },
  { value: "Kuwait", label: "Kuwait" },
  { value: "Bahrain", label: "Bahrain" },
  { value: "Oman", label: "Oman" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "United States", label: "United States" },
  { value: "India", label: "India" },
];

/** Logo upload limits. */
export const LOGO_MAX_BYTES = 2 * 1024 * 1024; // 2 MB
export const LOGO_ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
];

/** Format a `working_days` set into a readable weekend summary. */
export function describeWeekend(workingDays: number[]): string {
  const weekend = WEEKDAYS.filter((d) => !workingDays.includes(d.value));
  if (weekend.length === 0) return "None";
  return weekend.map((d) => d.short).join(", ");
}

/** Format a `working_days` set into a readable working-days summary. */
export function describeWorkingDays(workingDays: number[]): string {
  const days = WEEKDAYS.filter((d) => workingDays.includes(d.value));
  if (days.length === 0) return "None";
  return days.map((d) => d.short).join(", ");
}
