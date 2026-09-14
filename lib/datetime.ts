import { getSystemConfig } from "./config";

/**
 * Standardized timezone-aware datetime formatter for DOS Club TalentOS.
 * Respects configured timezone (default: Asia/Kolkata / IST) and locale (en-IN).
 */
export function formatConfigDateTime(
  dateInput: string | number | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateInput) return "—";

  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "—";

    const config = getSystemConfig();
    const defaultOptions: Intl.DateTimeFormatOptions = {
      timeZone: config.timezone,
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZoneName: "short",
      ...options,
    };

    return new Intl.DateTimeFormat(config.locale || "en-IN", defaultOptions).format(date);
  } catch (err) {
    console.warn("DateTime format error:", err);
    return String(dateInput);
  }
}

/**
 * Time-only formatter (e.g., "08:25:07 AM IST")
 */
export function formatConfigTime(
  dateInput: string | number | Date | null | undefined,
  includeSeconds = true
): string {
  if (!dateInput) return "—";

  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "—";

    const config = getSystemConfig();
    const options: Intl.DateTimeFormatOptions = {
      timeZone: config.timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: includeSeconds ? "2-digit" : undefined,
      hour12: true,
      timeZoneName: "short",
    };

    return new Intl.DateTimeFormat(config.locale || "en-IN", options).format(date);
  } catch (err) {
    return String(dateInput);
  }
}

/**
 * Date-only formatter (e.g., "14 Sep 2026")
 */
export function formatConfigDate(
  dateInput: string | number | Date | null | undefined
): string {
  if (!dateInput) return "—";

  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "—";

    const config = getSystemConfig();
    const options: Intl.DateTimeFormatOptions = {
      timeZone: config.timezone,
      year: "numeric",
      month: "short",
      day: "2-digit",
    };

    return new Intl.DateTimeFormat(config.locale || "en-IN", options).format(date);
  } catch (err) {
    return String(dateInput);
  }
}

/**
 * Returns current timestamp in configured timezone with abbreviation (e.g., "08:25:07 AM IST")
 */
export function getCurrentConfigTimeString(): string {
  return formatConfigTime(new Date(), true);
}
