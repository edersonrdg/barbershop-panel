import type { z } from 'zod';
import type { FieldErrors } from '@/lib/api/errors';

export type FormValues = Record<string, string | string[]>;

// Shape shared by every form action used with `useActionState`.
export interface FormState {
  message?: string;
  success?: string;
  fieldErrors?: FieldErrors;
  // Echoed back so the form keeps what the user typed after an error.
  values?: FormValues;
}

export function zodFieldErrors(error: z.ZodError): FieldErrors {
  const fieldErrors: FieldErrors = {};
  for (const issue of error.issues) {
    fieldErrors[issue.path.join('.')] ??= issue.message;
  }
  return fieldErrors;
}

// First error of a field or of any item under it (e.g. `serviceIds.2`).
export function errorUnder(
  fieldErrors: FieldErrors | undefined,
  field: string,
): string | undefined {
  if (!fieldErrors) return undefined;
  if (fieldErrors[field]) return fieldErrors[field];
  const key = Object.keys(fieldErrors).find((k) => k.startsWith(`${field}.`));
  return key ? fieldErrors[key] : undefined;
}

// Passwords (and anything else in `omit`) are never sent back to the browser.
export function formValues(
  formData: FormData,
  omit: readonly string[] = [],
): FormValues {
  const values: FormValues = {};
  for (const key of new Set(formData.keys())) {
    if (key.startsWith('$ACTION') || omit.includes(key)) continue;
    const all = formData.getAll(key).filter((v) => typeof v === 'string');
    values[key] = all.length === 1 ? all[0] : all;
  }
  return values;
}

export function valueOf(
  values: FormValues | undefined,
  key: string,
): string | undefined {
  const value = values?.[key];
  return Array.isArray(value) ? value[0] : value;
}

// An unchecked checkbox is simply missing from the submission, so once the
// form was submitted a missing key means "none", not "use the initial value".
export function valuesOf(
  values: FormValues | undefined,
  key: string,
  initial: readonly string[],
): readonly string[] {
  if (!values) return initial;
  const value = values[key];
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export function checkedOf(
  values: FormValues | undefined,
  key: string,
  initial: boolean,
): boolean {
  return values ? key in values : initial;
}
