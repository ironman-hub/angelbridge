import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "./auth";

export function ok(data: unknown = { ok: true }, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

/** Wrap a route handler with consistent error handling. */
export function handler<T extends unknown[]>(
  fn: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of err.issues) {
          const key = issue.path.join(".") || "form";
          if (!fieldErrors[key]) fieldErrors[key] = issue.message;
        }
        return fail("Please fix the highlighted fields", 422, { fieldErrors });
      }
      if (err instanceof AuthError) return fail(err.message, err.status);
      console.error(err);
      return fail("Something went wrong. Please try again.", 500);
    }
  };
}
