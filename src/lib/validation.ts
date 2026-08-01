import { z } from "zod";

// Geo helpers live in a dependency-free module; re-exported here for callers
// that already import them from "@/lib/validation".
export { haversineKm, pilotCentre, isInPilotArea } from "./geo";

// --- UK-specific validators -------------------------------------------------

// UK mobile/landline in national (07..., 01..., 02...) or +44 international form.
const UK_PHONE_RE = /^(?:(?:\+44\s?|0)(?:\d\s?){9,10})$/;

export function normalisePhone(input: string): string {
  return input.replace(/[\s()-]/g, "");
}

export function isValidUkPhone(input: string): boolean {
  const p = normalisePhone(input);
  if (p.startsWith("+44")) return /^\+44\d{9,10}$/.test(p);
  return /^0\d{9,10}$/.test(p);
}

// UK postcode (Royal Mail spec, tolerant of spacing/case).
const UK_POSTCODE_RE =
  /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z]))))\s?[0-9][A-Za-z]{2})$/;

export function isValidUkPostcode(input: string): boolean {
  return UK_POSTCODE_RE.test(input.trim());
}

export const ukPhone = z
  .string()
  .min(1, "Phone number is required")
  .refine(isValidUkPhone, "Enter a valid UK phone number (e.g. 07123 456789)");

export const ukPostcode = z
  .string()
  .min(1, "Postcode is required")
  .refine(isValidUkPostcode, "Enter a valid UK postcode");

// --- Auth schemas -----------------------------------------------------------

export const registerSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Enter a valid email address"),
  phone: ukPhone,
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
