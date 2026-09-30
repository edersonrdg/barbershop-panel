import { z } from 'zod';

const apiErrorSchema = z.object({
  message: z.string(),
  errors: z
    .array(z.object({ field: z.string(), message: z.string() }))
    .optional(),
});

export type FieldErrors = Record<string, string>;

export interface ApiError {
  message: string;
  fieldErrors: FieldErrors;
}

const FALLBACK_MESSAGE = 'Não foi possível concluir. Tente de novo.';

export function toApiError(body: unknown): ApiError {
  const parsed = apiErrorSchema.safeParse(body);
  if (!parsed.success) return { message: FALLBACK_MESSAGE, fieldErrors: {} };

  const fieldErrors: FieldErrors = {};
  for (const { field, message } of parsed.data.errors ?? []) {
    fieldErrors[field] ??= message;
  }
  return { message: parsed.data.message, fieldErrors };
}
