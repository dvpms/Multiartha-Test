import { NextResponse } from "next/server";

export function jsonOk(data, { status = 200 } = {}) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function jsonError(message, { status = 500, code, issues, details } = {}) {
  return NextResponse.json(
    { ok: false, error: { message, code, issues, details } },
    { status }
  );
}
