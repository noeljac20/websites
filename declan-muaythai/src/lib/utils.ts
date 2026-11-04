import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function errorMessage(err: unknown, fallback = "Something went wrong. Please try again.") {
  if (err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string") {
    const m = (err as { message: string }).message;
    // Postgres wraps our custom messages; keep them readable.
    return m.replace(/^.*?:\s*/, (s) => (s.length > 40 ? "" : s)).trim() || fallback;
  }
  return fallback;
}
