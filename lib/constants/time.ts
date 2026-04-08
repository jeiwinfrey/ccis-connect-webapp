// Time Constants

export const DAYS_OF_WEEK = [
  { short: "Sun", label: "Sunday", idx: 0 },
  { short: "Mon", label: "Monday", idx: 1 },
  { short: "Tue", label: "Tuesday", idx: 2 },
  { short: "Wed", label: "Wednesday", idx: 3 },
  { short: "Thu", label: "Thursday", idx: 4 },
  { short: "Fri", label: "Friday", idx: 5 },
  { short: "Sat", label: "Saturday", idx: 6 },
] as const;

export const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7 AM – 9 PM

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
