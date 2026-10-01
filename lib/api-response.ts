import { NextResponse } from "next/server";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(
  message: string,
  status = 400,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json(
    { success: false, error: message, ...extra },
    { status },
  );
}

// NOTE: the frontend already reads { error } from failed responses
// and { data } from successful ones. This shape stays consistent with
// the current route convention.
