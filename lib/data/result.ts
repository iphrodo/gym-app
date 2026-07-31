export type Result<T> = { ok: true; value: T } | { ok: false; error: unknown };

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function err<T = never>(error: unknown): Result<T> {
  return { ok: false, error };
}
