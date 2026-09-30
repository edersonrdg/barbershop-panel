import { z } from 'zod';

// Helpers for reading `searchParams`: any value may repeat or be missing, and
// nothing from the URL goes to the API before it is checked.

export function single(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function list(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export function isUuid(value: string | undefined): value is string {
  return z.uuid().safeParse(value).success;
}
